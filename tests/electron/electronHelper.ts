import path from 'path'
import fs from 'fs'
import * as ASAR from '@electron/asar'

export interface PackageJson {
    [key: string]: unknown
    name: string
    productName?: string
    main: string
    version: string
    description?: string
    author?: string | { name: string; email: string }
    license?: string
    repository?: string
    homepage?: string
    bugs?: string | { url: string }
}

type Architecture = 'x64' | 'x32' | 'arm64' | 'universal' | undefined

export interface ElectronAppInfo {
    /** Path to the app's executable file */
    executable: string
    /** Path to the app's main (JS) file */
    main: string
    /** Name of the app */
    name: string
    /** Resources directory */
    resourcesDir: string
    /** True if the app is using asar */
    asar: boolean
    /** OS platform */
    platform: 'darwin' | 'win32' | 'linux'
    /** Architecture */
    arch: Architecture
    /** The JSON.parse()'d contents of the package.json file. */
    packageJson: PackageJson
}

export function parseElectronApp(buildDir: string): ElectronAppInfo {
    // The platform of the app
    let platform: 'darwin' | 'win32' | 'linux' | undefined

    // in case the buildDir is the path to the app itself
    if (buildDir.endsWith('.app')) {
        buildDir = path.dirname(buildDir)
        platform = 'darwin'
    } else if (buildDir.endsWith('.exe')) {
        buildDir = path.dirname(buildDir)
        platform = 'win32'
    } else {
        buildDir = path.dirname(buildDir);
        platform = 'linux'
    }

    // The name of the build directory CONVERTED TO LOWERCASE
    const baseNameLc = path.basename(buildDir).toLowerCase()
    if (!platform) {
        // parse the directory name to figure out the platform
        if (baseNameLc.includes('win')) {
            platform = 'win32'
        }
        if (
            baseNameLc.includes('linux') ||
            baseNameLc.includes('ubuntu') ||
            baseNameLc.includes('debian')
        ) {
            platform = 'linux'
        }
        if (
            baseNameLc.includes('darwin') ||
            baseNameLc.includes('mac') ||
            baseNameLc.includes('osx')
        ) {
            platform = 'darwin'
        }
    }

    if (!platform) {
        throw new Error(`Platform not found in directory name: ${baseNameLc}`)
    }

    let arch: Architecture
    if (baseNameLc.includes('x32') || baseNameLc.includes('i386')) {
        arch = 'x32'
    }
    if (baseNameLc.includes('x64')) {
        arch = 'x64'
    }
    if (baseNameLc.includes('arm64')) {
        arch = 'arm64'
    }
    if (baseNameLc.includes('universal')) {
        arch = 'universal'
    }

    if (!arch) {
        // we still haven't figured out architecture
        // let's get a little more desperate
        if (baseNameLc.includes('x86')) {
            arch = 'x32'
        } else if (baseNameLc.includes('arm')) {
            arch = 'arm64'
        } else if (baseNameLc.includes('univ')) {
            arch = 'universal'
        }
    }

    let executable: string
    let main: string
    let name: string
    let asar: boolean
    let resourcesDir: string
    let packageJson: PackageJson

    if (platform === 'darwin') {
        // MacOS Structure
        // <buildDir>/
        //   <appName>.app/
        //     Contents/
        //       MacOS/
        //        <appName> (executable)
        //       Info.plist
        //       PkgInfo
        //       Resources/
        //         electron.icns
        //         file.icns
        //         app.asar (asar bundle) - or -
        //         app
        //           package.json
        //           (your app structure)
        const list = fs.readdirSync(buildDir)
        const appBundle = list.find((fileName) => {
            return fileName.endsWith('.app')
        })
        if (!appBundle) {
            throw new Error(`Could not find app bundle in ${buildDir}`)
        }
        const appDir = path.join(buildDir, appBundle, 'Contents', 'MacOS')
        const appName = fs.readdirSync(appDir)[0]
        executable = path.join(appDir, appName)

        resourcesDir = path.join(buildDir, appBundle, 'Contents', 'Resources')
        const resourcesList = fs.readdirSync(resourcesDir)
        asar = resourcesList.includes('app.asar')

        if (asar) {
            const asarPath = path.join(resourcesDir, 'app.asar')
            packageJson = JSON.parse(
                ASAR.extractFile(asarPath, 'package.json').toString('utf8')
            )
            main = path.join(asarPath, packageJson.main)
        } else {
            packageJson = JSON.parse(
                fs.readFileSync(path.join(resourcesDir, 'app', 'package.json'), 'utf8')
            )
            main = path.join(resourcesDir, 'app', packageJson.main)
        }
        name = packageJson.name
    } else if (platform === 'win32') {
        // Windows Structure
        // <buildDir>/
        //   <appName>.exe (executable)
        //   resources/
        //     app.asar (asar bundle) - or -
        //     app
        //       package.json
        //       (your app structure)
        const list = fs.readdirSync(buildDir)

        // !! assume the executable is the only .exe file in the directory
        const exe = list.find((fileName) => {
            return fileName.endsWith('.exe')
        })
        if (!exe) {
            throw new Error(`Could not find executable in ${buildDir}`)
        }
        executable = path.join(buildDir, exe)

        resourcesDir = path.join(buildDir, 'resources')
        const resourcesList = fs.readdirSync(resourcesDir)
        asar = resourcesList.includes('app.asar')

        if (asar) {
            const asarPath = path.join(resourcesDir, 'app.asar')
            packageJson = JSON.parse(
                ASAR.extractFile(asarPath, 'package.json').toString('utf8')
            )
            main = path.join(asarPath, packageJson.main)
        } else {
            packageJson = JSON.parse(
                fs.readFileSync(path.join(resourcesDir, 'app', 'package.json'), 'utf8')
            )
            main = path.join(resourcesDir, 'app', packageJson.main)
        }
        name = packageJson.name
    } else if (platform === 'linux') {
        // Linux Structure
        // <buildDir>/
        //   <appName> (executable)
        //   resources/
        //     app.asar (asar bundle) - or -
        //     app --- (untested - we're making assumptions here)
        //       package.json
        //       (your app structure)

        const list = fs.readdirSync(buildDir)
        const exeCandidates = list.filter((fileName) => {
            // Assume the executable is the only file in the directory that...
            // ...does not have one of these suffixes
            const ignoreSuffixes = [
                '.so',
                '.so.1',
                '.so.2',
                '.bin',
                '.pak',
                '.dat',
                '.json',
            ]
            // ...does not have one of these names
            const ignoreNames = ['resources', 'locales', 'version', 'LICENSE']
            // ...does not start with one of these names
            const ignoreStartsWith = ['chrome-', 'chrome_', 'lib', 'LICENSE']

            if (ignoreSuffixes.some((suffix) => fileName.endsWith(suffix))) {
                return false
            }
            if (ignoreNames.some((name) => fileName === name)) {
                return false
            }
            if (ignoreStartsWith.some((name) => fileName.startsWith(name))) {
                return false
            }
            const filePath = path.join(buildDir, fileName)
            const stats = fs.statSync(filePath)

            // ...is not a directory
            if (stats.isDirectory()) {
                return false
            }

            // ...is not a symlink
            if (stats.isSymbolicLink()) {
                return false
            }

            // ...is executable
            try {
                fs.accessSync(filePath, fs.constants.X_OK)
                return true
            } catch (err) {
                return false
            }
        })
        if (exeCandidates.length > 1) {
            console.warn(
                `Found ${exeCandidates.length} executable files in ${buildDir}. Will use the first: ${exeCandidates[0]}. If this is not the correct executable, please file an issue at https://github.com/spaceagetv/electron-playwright-helpers/issues`
            )
        }
        if (exeCandidates.length < 1) {
            throw new Error(
                `Could not find executable file in ${buildDir}. Please check your build directory. If file exists, please make sure it is executable. If file is executable, please file an issue at https://github.com/spaceagetv/electron-playwright-helpers/issues`
            )
        }
        executable = path.join(buildDir, exeCandidates[0])

        resourcesDir = path.join(buildDir, 'resources')
        const resourcesList = fs.readdirSync(resourcesDir)
        asar = resourcesList.includes('app.asar')
        if (asar) {
            const asarPath = path.join(resourcesDir, 'app.asar')
            packageJson = JSON.parse(
                ASAR.extractFile(asarPath, 'package.json').toString('utf8')
            )
            main = path.join(asarPath, packageJson.main)
        } else {
            try {
                packageJson = JSON.parse(
                    fs.readFileSync(
                        path.join(resourcesDir, 'app', 'package.json'),
                        'utf8'
                    )
                )
                main = path.join(resourcesDir, 'app', packageJson.main)
            } catch (err) {
                throw new Error(
                    `Could not find package.json in ${resourcesDir}. Apparently we don't quite know how Electron works on Linux yet. Please submit a bug report or pull request!`
                )
            }
        }
        // get the name field from package.json
        name = packageJson.name
    } else {
        throw new Error(`Platform not supported: ${platform}`)
    }
    return {
        executable,
        main,
        asar,
        name,
        platform,
        resourcesDir,
        arch,
        packageJson,
    }
}