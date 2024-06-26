<script lang="ts">
	import { IconChartPie, IconHome, IconMenu2, IconSettings } from '@tabler/icons-svelte';

	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import { AppShell, AppBar, LightSwitch, Drawer, Modal, Toast } from '@skeletonlabs/skeleton';
	import { getDrawerStore, initializeStores } from '@skeletonlabs/skeleton';
	import { computePosition, offset, arrow } from '@floating-ui/dom';
	import { onDestroy, onMount } from 'svelte';
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { LL, setLocale } from '../i18n/i18n-svelte';
	import { detectLocale } from '../i18n/i18n-util';
	import { localStorageDetector } from 'typesafe-i18n/detectors';
	import { loadLocaleAsync } from '../i18n/i18n-util.async';
	import { setInitialClassState } from '@skeletonlabs/skeleton';
	import { settingsStore } from '../stores/store';

	initializeStores();
	const drawerStore = getDrawerStore();

	let appVersion: string = '';
	let message: string = '';
	let showRestartBtn: boolean = false;
	let showSpinner: boolean = false;
	let activatePopup: boolean = false;

	let tooltipDiv: HTMLDivElement;
	let referenceDiv: HTMLDivElement;
	let arrowDiv: HTMLDivElement;

	function showPopup(
		referenceDiv: HTMLDivElement,
		tooltipDiv: HTMLDivElement,
		arrowDiv: HTMLDivElement
	) {
		const floatingOffset = Math.sqrt(2 * arrowDiv.offsetWidth ** 2) / 2;
		computePosition(referenceDiv, tooltipDiv, {
			placement: 'right',
			middleware: [offset(floatingOffset), arrow({ element: arrowDiv })]
		}).then(({ x, y, middlewareData }) => {
			Object.assign(tooltipDiv.style, {
				top: `${y}px`,
				left: `${x}px`
			});

			if (middlewareData.arrow) {
				const { y } = middlewareData.arrow;

				Object.assign(arrowDiv.style, {
					//left: x != null ? `${x}px` : '',
					top: y != null ? `${y}px` : '',
					right: '',
					bottom: '',
					left: `${-arrowDiv.offsetWidth / 2}px`,
					transform: 'rotate(45deg)'
				});
			}
		});
	}

	function checkForUpdates() {
		if ((window as any)?.IN_DESKTOP_ENV) {
			(window as any).ipcRenderer.send('check_for_updates');
			showSpinner = true;
		}
	}

	function restartApp() {
		(window as any).ipcRenderer.removeAllListeners('before-quit');
		(window as any).ipcRenderer.send('restart_app');
	}

	onMount(async () => {
		// Set init dark / light mode
		setInitialClassState();

		// Localization
		const detectedLocale = detectLocale(localStorageDetector);
		await loadLocaleAsync(detectedLocale);
		setLocale(detectedLocale);

		if ((window as any)?.IN_DESKTOP_ENV && !(window as any)?.APP_TESTING) {
			(window as any).ipcRenderer.send('change-Language', detectedLocale);

			// Show window if option is selected
			if ($settingsStore.showAfterStartup) {
				(window as any).ipcRenderer.send('show-After-Startup');
				(window as any).ipcRenderer.removeAllListeners('show-After-Startup');
			}

			(window as any).ipcRenderer.send('change-AutoStart', $settingsStore.startAfterBoot);

			// Electron Updater
			(window as any).ipcRenderer.send('app_version');

			(window as any).ipcRenderer.on('app_version', (event: any, message: any) => {
				(window as any).ipcRenderer.removeAllListeners('app_version');
				appVersion = message.version;
			});

			// TODO: change update function location
			(window as any).ipcRenderer.on('update_available', () => {
				message = $LL.UPDATE.TOOLTIP_UPDATE_AVAILABLE();

				showSpinner = true;
				activatePopup = true;
			});

			(window as any).ipcRenderer.on('update_not_available', () => {
				message = $LL.UPDATE.TOOLTIP_UPDATE_NOT_AVAILABLE();

				showSpinner = false;
				activatePopup = true;
			});

			(window as any).ipcRenderer.on('update_error', (event: any, error: any) => {
				message = $LL.UPDATE.TOOLTIP_UPDATE_ERROR();

				showSpinner = false;
				activatePopup = true;
			});

			(window as any).ipcRenderer.on('update_downloaded', () => {
				message = $LL.UPDATE.TOOLTIP_UPDATE_DOWNLOADED();

				showSpinner = false;
				activatePopup = true;
				showRestartBtn = true;
			});
		}
	});

	onDestroy(() => {
		if ((window as any)?.IN_DESKTOP_ENV) {
			(window as any).ipcRenderer.removeAllListeners('update_available');
			(window as any).ipcRenderer.removeAllListeners('update_not_available');
			(window as any).ipcRenderer.removeAllListeners('update_error');
			(window as any).ipcRenderer.removeAllListeners('update_downloaded');
			(window as any).ipcRenderer.removeAllListeners('show-After-Startup');
		}
	});

	$: if (activatePopup) {
		showPopup(referenceDiv, tooltipDiv, arrowDiv);
		setTimeout(() => {
			activatePopup = false;
		}, 5000);
	}
</script>

<Drawer>
	<div class="flex flex-col items-stretch gap-y-3 p-4">
		<a class="btn variant-ringed" href="/" on:click={() => drawerStore.close()} aria-label="Home">
			<IconHome /><span class="text-lg font-semibold">{$LL.HOME_LABEL()}</span>
		</a>
		<a
			class="btn variant-ringed"
			href="/statistics"
			on:click={() => drawerStore.close()}
			aria-label="Statistics"
		>
			<IconChartPie /><span class="text-lg font-semibold">{$LL.STATISTICS_LABEL()}</span>
		</a>
		<a
			data-testid="layout-settings-link"
			class="btn variant-ringed"
			href="/settings"
			on:click={() => drawerStore.close()}
			aria-label="Settings"
		>
			<IconSettings /><span class="text-lg font-semibold">{$LL.SETTINGS_LABEL()}</span>
		</a>
	</div>
</Drawer>

<Toast position="tr" />

<AppShell>
	<svelte:fragment slot="header">
		<AppBar
			gridColumns="grid-cols-3"
			slotDefault="place-self-center text-center w-max"
			slotTrail="place-content-end"
		>
			<svelte:fragment slot="lead">
				<div class="flex flex-col text-center">
					<a class="text-xl uppercase" href="/" aria-label="Home">
						<span class="hidden lg:inline-flex">TimeTracker</span>
						<!--TODO: LOGO-->
						<span class="inline-flex lg:hidden">TT</span>
					</a>
					<div class="flex flex-row items-center relative w-full" bind:this={referenceDiv}>
						<button class="text-xs text-surface-400 p-2 mx-auto" on:click={checkForUpdates}
							>{$LL.UPDATE.VERSION_LABEL({ version: appVersion })}</button
						>
						<div class:hidden={!showSpinner} class="absolute right-0">
							<ProgressRadial
								width="w-4"
								stroke={170}
								meter="stroke-primary-500"
								track="stroke-primary-500/30"
							/>
						</div>
						<button
							class:hidden={!showRestartBtn}
							class="btn variant-filled-primary text-xs p-1.5 absolute -right-14 lg:-right-10"
							on:click={restartApp}
						>
							{$LL.UPDATE.RESTART_LABEL()}
						</button>
					</div>
				</div>
				<div
					id="floating"
					class:hidden={!activatePopup}
					class="absolute bg-surface-400 p-2 ml-3 rounded-md cursor-pointer w-fit"
					bind:this={tooltipDiv}
					on:click={() => (activatePopup = false)}
					on:keypress={() => (activatePopup = false)}
				>
					<p>{message}</p>
					<div id="arrow" class="absolute h-3 w-3 bg-surface-400" bind:this={arrowDiv} />
				</div>
			</svelte:fragment>
			<button
				class="btn variant-ringed inline-flex lg:hidden"
				on:click={() => drawerStore.open({ position: 'top', height: 'h-fit' })}
				><IconMenu2 />
			</button>
			<a class="btn variant-ringed hidden lg:inline-flex mx-2" href="/" aria-label="Home">
				<IconHome /><span class="text-lg font-semibold">{$LL.HOME_LABEL()}</span>
			</a>
			<a
				class="btn variant-ringed hidden lg:inline-flex mx-2"
				href="/statistics"
				aria-label="Statistics"
			>
				<IconChartPie /><span class="text-lg font-semibold">{$LL.STATISTICS_LABEL()}</span>
			</a>
			<svelte:fragment slot="trail">
				<a
					class="btn hidden sm:inline-flex"
					href="/settings"
					aria-label="Settings"
					data-testid="layout-settings-link"
				>
					<IconSettings />
				</a>
				<LightSwitch />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<slot class="h-screen" />
</AppShell>
