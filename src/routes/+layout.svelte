<script lang="ts">
	import { IconChartPie, IconHome, IconMenu2, IconSettings } from '@tabler/icons-svelte';

	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import { AppShell, AppBar, LightSwitch, Drawer } from '@skeletonlabs/skeleton';
	import { getDrawerStore, initializeStores } from '@skeletonlabs/skeleton';
	import { computePosition, offset, arrow } from '@floating-ui/dom';
	import { onMount } from 'svelte';
	import { ProgressRadial } from '@skeletonlabs/skeleton';

	initializeStores();
	const drawerStore = getDrawerStore();

	let appVersion: string = '';
	let message: string = '';
	let showRestartBtn: boolean = false;
	let showSpinner: boolean = false;
	let updateAvailable: boolean = false;

	let tooltipDiv: HTMLDivElement;
	let referenceDiv: HTMLDivElement;
	let arrowDiv: HTMLDivElement;

	function restartApp() {
		(window as any).ipcRenderer.send('restart_app');
	}

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

	onMount(() => {
		if ((window as any)?.IN_DESKTOP_ENV) {
			(window as any).ipcRenderer.send('app_version');

			(window as any).ipcRenderer.on('app_version', (event: any, message: any) => {
				(window as any).ipcRenderer.removeAllListeners('app_version');
				appVersion = message.version;
			});

			// TODO: change update function location
			(window as any).ipcRenderer.on('update_available', () => {
				(window as any).ipcRenderer.removeAllListeners('update_available');
				message = 'A new update is available. Downloading now...';

				console.log(message);
				showSpinner = true;
				updateAvailable = true;
			});

			(window as any).ipcRenderer.on('update_downloaded', () => {
				(window as any).ipcRenderer.removeAllListeners('update_downloaded');
				message = 'Update Downloaded. It will be installed on restart. Restart now?';
				console.log(message);
				showSpinner = false;
				showRestartBtn = true;
			});
		}
	});

	$: if (updateAvailable) {
		showPopup(referenceDiv, tooltipDiv, arrowDiv);
	}
</script>

<svelte:head>
	<title>TimeTracker</title>
</svelte:head>

<Drawer>
	<div class="flex flex-col items-stretch gap-y-3 p-4">
		<a class="btn variant-ringed" href="/" on:click={() => drawerStore.close()} aria-label="Home">
			<IconHome /><span class="text-lg font-semibold">Home</span>
		</a>
		<a
			class="btn variant-ringed"
			href="/statistics"
			on:click={() => drawerStore.close()}
			aria-label="Statistics"
		>
			<IconChartPie /><span class="text-lg font-semibold">Statistics</span>
		</a>
		<a
			class="btn variant-ringed"
			href="/settings"
			on:click={() => drawerStore.close()}
			aria-label="Settings"
		>
			<IconSettings /><span class="text-lg font-semibold">Settings</span>
		</a>
	</div>
</Drawer>
<AppShell>
	<svelte:fragment slot="header">
		<AppBar
			gridColumns="grid-cols-3"
			slotDefault="place-self-center text-center lg:text-left"
			slotTrail="place-content-end"
		>
			<svelte:fragment slot="lead">
				<div class="flex flex-col text-center">
					<a class="text-xl uppercase" href="/" aria-label="Home">
						<span class="hidden lg:inline-flex">TimeTracker</span>
						<!--TODO: LOGO-->
						<span class="inline-flex lg:hidden">TT</span>
					</a>
					<div class="flex flex-row items-center mt-1 relative w-full" bind:this={referenceDiv}>
						<span class="text-xs text-surface-400 p-2 mx-auto">Version: {appVersion}</span>
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
							class="btn variant-filled-primary text-xs p-1.5 absolute -right-12 lg:-right-8"
							on:click={restartApp}
						>
							Restart
						</button>
					</div>
				</div>
				<div
					id="floating"
					class:hidden={!updateAvailable}
					class="absolute bg-surface-400 p-2 ml-3 rounded-md"
					bind:this={tooltipDiv}
				>
					{message}
					<div id="arrow" class="absolute h-3 w-3 bg-surface-400" bind:this={arrowDiv} />
				</div>
			</svelte:fragment>
			<button
				class="btn variant-ringed inline-flex lg:hidden"
				on:click={() => drawerStore.open({ position: 'top', height: 'h-fit' })}
				><IconMenu2 />
			</button>
			<a class="btn variant-ringed hidden lg:inline-flex" href="/" aria-label="Home">
				<IconHome /><span class="text-lg font-semibold">Home</span>
			</a>
			<a
				class="btn variant-ringed hidden lg:inline-flex"
				href="/statistics"
				aria-label="Statistics"
			>
				<IconChartPie /><span class="text-lg font-semibold">Statistics</span>
			</a>
			<svelte:fragment slot="trail">
				<a class="btn hidden md:inline-flex" href="/settings" aria-label="Settings">
					<IconSettings />
				</a>
				<LightSwitch />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<slot class="h-screen" />
</AppShell>
