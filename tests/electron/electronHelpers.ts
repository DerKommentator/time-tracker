// Code snippets from https://github.com/kubeshop/monokle/blob/main/tests/
// cross-env APP_TESTING=true xvfb-maybe npx playwright test
import * as ASAR from '@electron/asar';
import * as fs from 'fs';
import log from 'loglevel';
import * as path from 'path';
import type { Page } from 'playwright/test';
import { type ElectronApplication, _electron as electron } from 'playwright-core';

interface StartAppResponse {
    electronApp: ElectronApplication;
    appWindow: Page;
    appInfo: ElectronAppInfo;
}

async function pause(ms: number) {
    return new Promise(f => setTimeout(f, ms));
}

export async function startApp(): Promise<StartAppResponse> {
    // find the latest build in the out directory
    const latestBuild = findLatestBuild();
    // parse the directory and find paths and other info
    const appInfo = parseElectronApp(latestBuild);
    const electronApp = await electron.launch({
        args: [appInfo.main, "--no-sandbox"],
        executablePath: appInfo.executable,
        recordVideo: {
            dir: "screenshots",
            size: {
                width: 1080,
                height: 720,
            },
        },
    });

    // electronApp.process().stdout?.on('data', (data) => console.log(`stdout: ${data}`));
    // electronApp.process().stderr?.on('data', (error) => console.log(`stderr: ${error}`));

    // wait for splash-screen to pass
    await electronApp.firstWindow();
    while (electronApp.windows().length === 2) {
        // eslint-disable-next-line no-await-in-loop
        await pause(100);
    }

    const windows = electronApp.windows();
    if (windows.length !== 1) {
        throw new Error('too many windows open');
    }
    const appWindow: Page = windows[0];
    appWindow.on('console', log.info);

    // Capture a screenshot.
    await appWindow.screenshot({
        path: 'screenshots/initial-screen.png'
    });

    return { appWindow, appInfo, electronApp };
}

export function findLatestBuild(): string {
    // root of your project
    const rootDir = path.resolve('./');
    // directory where the builds are stored
    const outDir = path.join(rootDir, 'dist');
    // list of files in the out directory
    const builds = fs.readdirSync(outDir);

    let platforms: string[] = [];

    if (process.platform === "win32") {
        platforms = ['win32', 'win', 'windows'];
    } else if (process.platform === "linux") {
        platforms = ['linux', 'ubuntu'];
    } else {
        platforms = ['darwin', 'mac', 'macos'];
    }

    const latestBuild = builds
        // eslint-disable-next-line array-callback-return
        .map(fileName => {
            // make sure it's a directory with "-" delimited platform in its name
            const stats = fs.statSync(path.join(outDir, fileName));
            const isBuild = fileName
                .toLocaleLowerCase()
                .split('-')
                .some(part => platforms.includes(part));
            if (stats.isDirectory() && isBuild) {
                return {
                    name: fileName,
                    time: fs.statSync(path.join(outDir, fileName)).mtimeMs,
                };
            }
        })
        // @ts-ignore
        .sort((a, b) => b.time - a.time)
        // eslint-disable-next-line array-callback-return
        .map(file => {
            if (file) {
                return file.name;
            }
        })[0];
    if (!latestBuild) {
        throw new Error('No build found in out directory');
    }
    return path.join(outDir, latestBuild);
}

type Architecture = 'x64' | 'x32' | 'arm64';
export interface ElectronAppInfo {
    /** Path to the app's executable file */
    executable: string;
    /** Path to the app's main (JS) file */
    main: string;
    /** Name of the app */
    name: string;
    /** Resources directory */
    resourcesDir: string;
    /** True if the app is using asar */
    asar: boolean;
    /** OS platform */
    platform: NodeJS.Platform;
    arch: Architecture;
}

export function parseElectronApp(buildDir: string): ElectronAppInfo {
    log.info(`Parsing Electron app in ${buildDir}`);
    let platform: string = process.platform;
    // if (buildDir.endsWith('.app')) {
    //     buildDir = path.dirname(buildDir);
    //     platform = 'darwin';
    // } else if (buildDir.endsWith('.exe')) {
    //     buildDir = path.dirname(buildDir);
    //     platform = 'win32';
    // } else {
    //     buildDir = path.dirname(buildDir);
    //     platform = "linux";
    // }

    const baseName = path.basename(buildDir).toLowerCase();
    if (!platform) {
        // parse the directory name to figure out the platform
        if (baseName.includes('win')) {
            platform = 'win32';
        }
        if (baseName.includes('linux') || baseName.includes('ubuntu') || baseName.includes('debian')) {
            platform = 'linux';
        }
        if (baseName.includes('darwin') || baseName.includes('mac') || baseName.includes('osx')) {
            platform = 'darwin';
        }
    }

    if (!platform) {
        throw new Error(`Platform not found in directory name: ${baseName}`);
    }

    let arch: Architecture;
    if (baseName.includes('x32') || baseName.includes('i386')) {
        arch = 'x32';
    }
    if (baseName.includes('x64')) {
        arch = 'x64';
    }
    if (baseName.includes('arm64')) {
        arch = 'arm64';
    }

    let executable: string;
    let main: string;
    let name: string;
    let asar: boolean;
    let resourcesDir: string;

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

        const list = fs.readdirSync(buildDir);
        const appBundle = list.find(fileName => {
            return fileName.endsWith('.app');
        });
        // @ts-ignore
        const appDir = path.join(buildDir, appBundle, 'Contents', 'MacOS');
        const appName = fs.readdirSync(appDir)[0];
        executable = path.join(appDir, appName);

        // @ts-ignore
        resourcesDir = path.join(buildDir, appBundle, 'Contents', 'Resources');
        const resourcesList = fs.readdirSync(resourcesDir);
        asar = resourcesList.includes('app.asar');

        let packageJson: { main: string; name: string };
        if (asar) {
            const asarPath = path.join(resourcesDir, 'app.asar');
            packageJson = JSON.parse(ASAR.extractFile(asarPath, 'package.json').toString('utf8'));
            main = path.join(asarPath, packageJson.main);
        } else {
            packageJson = JSON.parse(fs.readFileSync(path.join(resourcesDir, 'app', 'package.json'), 'utf8'));
            main = path.join(resourcesDir, 'app', packageJson.main);
        }
        name = packageJson.name;
    } else if (platform === 'win32') {
        // Windows Structure
        // <buildDir>/
        //   <appName>.exe (executable)
        //   resources/
        //     app.asar (asar bundle) - or -
        //     app
        //       package.json
        //       (your app structure)

        const list = fs.readdirSync(buildDir);
        const exe = list.find(fileName => {
            return fileName.endsWith('.exe');
        });
        // @ts-ignore
        executable = path.join(buildDir, exe);

        resourcesDir = path.join(buildDir, 'resources');
        const resourcesList = fs.readdirSync(resourcesDir);
        asar = resourcesList.includes('app.asar');

        let packageJson: { main: string; name: string };

        if (asar) {
            const asarPath = path.join(resourcesDir, 'app.asar');
            packageJson = JSON.parse(ASAR.extractFile(asarPath, 'package.json').toString("utf8"));
            main = path.join(asarPath, packageJson.main);
        } else {
            packageJson = JSON.parse(fs.readFileSync(path.join(resourcesDir, 'app', 'package.json'), 'utf8'));
            main = path.join(resourcesDir, 'app', packageJson.main);
        }
        name = packageJson.name;
    } else if (platform === "linux") {
        // Linux Structure
        // <buildDir>/
        //   <appName> (executable)
        //   resources/
        //     app.asar (asar bundle) - or -
        //     app
        //       package.json
        //       (your app structure)
        const list = fs.readdirSync(buildDir);
        const exe = list.find(fileName => {
            return fileName.includes("timetracker");
        });
        // @ts-ignore
        executable = path.join(buildDir, exe);

        resourcesDir = path.join(buildDir, 'resources');
        const resourcesList = fs.readdirSync(resourcesDir);
        asar = resourcesList.includes('app.asar');

        let packageJson: { main: string; name: string };

        if (asar) {
            const asarPath = path.join(resourcesDir, 'app.asar');
            packageJson = JSON.parse(ASAR.extractFile(asarPath, 'package.json').toString('utf8'));
            main = path.join(asarPath, packageJson.main);
        } else {
            packageJson = JSON.parse(fs.readFileSync(path.join(resourcesDir, 'app', 'package.json'), 'utf8'));
            main = path.join(resourcesDir, 'app', packageJson.main);
        }
        name = packageJson.name;
    } else {
        throw new Error(`Platform not supported: ${platform}`);
    }

    return {
        executable,
        main,
        asar,
        name,
        platform,
        resourcesDir,
        // @ts-ignore
        arch,
    };
}