<script lang="ts">
	import type { Time } from '$lib/models/Time';
	import { IconArrowBack } from '@tabler/icons-svelte';
	import { settingsStore } from '../../stores/store';
	import { Toast, getToastStore, type ToastSettings, SlideToggle } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import { formatTime } from '$lib/utils/HelperFunctions';

	initializeStores();
	const toastStore = getToastStore();

	let startTime: string = formatTime($settingsStore.standardStartTime || { hours: 7, minutes: 30 });
	let plannedWorkingTime: string = formatTime(
		$settingsStore.plannedWorkingTime || { hours: 7, minutes: 30 }
	);

	let useStartupTime: boolean = $settingsStore.useStartupTime;

	function saveSettings() {
		const startTimes = startTime.split(':');
		const plannedTimes = startTime.split(':');
		const start: Time = { hours: parseInt(startTimes[0]), minutes: parseInt(startTimes[1]) };
		const planned: Time = { hours: parseInt(plannedTimes[0]), minutes: parseInt(plannedTimes[1]) };

		$settingsStore.standardStartTime = start;
		$settingsStore.plannedWorkingTime = planned;
		$settingsStore.useStartupTime = useStartupTime;

		const toastSettings: ToastSettings = {
			message: 'Erfolgreich gesichert!',
			background: 'variant-filled-success'
		};
		toastStore.trigger(toastSettings);
	}
</script>

<div>
	<a class="btn variant-filled-primary m-10" href="/" aria-label="Home">
		<IconArrowBack />
	</a>
	<Toast position="tr" />

	<div class="card p-4 mx-4 lg:mx-auto lg:w-1/2">
		<header class="card-header text-xl text-center"><strong>Settings</strong></header>
		<section class="m-8">
			<div>
				<span><strong>Daily start of work:</strong></span>
				<div class="flex gap-4 m-2 mb-8">
					<input
						class="input text-center text-lg"
						type="time"
						bind:value={startTime}
						aria-label="Settings: Set daily start of work"
					/>
				</div>
			</div>
			<div>
				<span><strong>Planned working time:</strong></span>
				<div class="flex gap-4 m-2 mb-8">
					<input
						class="input text-center text-lg"
						type="time"
						bind:value={plannedWorkingTime}
						aria-label="Settings: Set planned working time"
					/>
				</div>
			</div>
			<div class="flex flex-row justify-between items-center">
				<span><strong>Use the time when the application is launched:</strong></span>
				<SlideToggle
					name="slide"
					active="bg-primary-500"
					size="md"
					class="m-2"
					bind:checked={useStartupTime}
				/>
			</div>
		</section>
		<hr />
		<footer class="card-footer flex flex-row justify-between items-center mt-8">
			<span class="text-surface-200">Some changes are applied only after the restart</span>
			<button class="btn variant-filled-primary" on:click={() => saveSettings()}>Save</button>
		</footer>
	</div>
</div>
