<script lang="ts">
	import { IconChartPie, IconHome, IconMenu2, IconSettings } from '@tabler/icons-svelte';

	// Most of your app wide CSS should be put in this file
	import '../app.postcss';
	import { AppShell, AppBar, LightSwitch, Drawer } from '@skeletonlabs/skeleton';
	import { getDrawerStore, initializeStores } from '@skeletonlabs/skeleton';
	initializeStores();
	const drawerStore = getDrawerStore();
</script>

<svelte:head>
	<title>TimeTracker</title>
</svelte:head>

<Drawer>
	<div class="flex flex-col items-stretch gap-y-3 p-4">
		<a class="btn variant-ringed" href="/" on:click={() => drawerStore.close()}>
			<IconHome /><span class="text-lg font-semibold">Home</span>
		</a>
		<a class="btn variant-ringed" href="/statistics" on:click={() => drawerStore.close()}>
			<IconChartPie /><span class="text-lg font-semibold">Statistiken</span>
		</a>
		<a class="btn variant-ringed" href="/settings" on:click={() => drawerStore.close()}>
			<IconSettings /><span class="text-lg font-semibold">Einstellungen</span>
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
				<a class="text-xl uppercase" href="/">
					<span class="hidden lg:inline-flex">TimeTracker</span>
					<!--TODO: LOGO-->
					<span class="inline-flex lg:hidden">TT</span>
				</a>
			</svelte:fragment>
			<button
				class="btn variant-ringed inline-flex lg:hidden"
				on:click={() => drawerStore.open({ position: 'top', height: 'h-fit' })}
				><IconMenu2 />
			</button>
			<a class="btn variant-ringed hidden lg:inline-flex" href="/">
				<IconHome /><span class="text-lg font-semibold">Home</span>
			</a>
			<a class="btn variant-ringed hidden lg:inline-flex" href="/statistics">
				<IconChartPie /><span class="text-lg font-semibold">Statistiken</span>
			</a>
			<svelte:fragment slot="trail">
				<a class="btn hidden md:inline-flex" href="/settings">
					<IconSettings />
				</a>
				<LightSwitch />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<slot class="h-screen" />
</AppShell>
