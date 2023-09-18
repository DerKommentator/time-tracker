<script lang="ts">
	import type { Time } from '$lib/models/Time';
	import { IconArrowBack } from '@tabler/icons-svelte';
	import { settingsStore } from '../../stores/store';
	import { Toast, getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';

	initializeStores();
	const toastStore = getToastStore();

	let startTime: string = formatTime($settingsStore.standardStartTime || { hours: 7, minutes: 30 });
	let plannedWorkingTime: string = formatTime(
		$settingsStore.plannedWorkingTime || { hours: 7, minutes: 30 }
	);

	function formatDate(date: Date): string {
		return (
			String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0')
		);
	}

	function formatTime(time: Time): string {
		return String(time.hours).padStart(2, '0') + ':' + String(time.minutes).padStart(2, '0');
	}

	function saveSettings() {
		const startTimes = startTime.split(':');
		const plannedTimes = startTime.split(':');
		const start: Time = { hours: parseInt(startTimes[0]), minutes: parseInt(startTimes[1]) };
		const planned: Time = { hours: parseInt(plannedTimes[0]), minutes: parseInt(plannedTimes[1]) };

		$settingsStore.standardStartTime = start;
		$settingsStore.plannedWorkingTime = planned;

		const toastSettings: ToastSettings = {
			message: 'Erfolgreich gesichert!',
			background: 'variant-filled-success'
		};
		toastStore.trigger(toastSettings);
	}
</script>

<div>
	<a class="btn variant-filled-primary m-10" href="/">
		<IconArrowBack />
	</a>
	<Toast position="tr" />

	<div class="card p-4 mx-4 lg:mx-auto lg:w-1/2">
		<header class="card-header text-xl text-center"><strong>Settings</strong></header>
		<section class="m-8">
			<div>
				<!--Täglicher Arbeitsbeginn (Standardeinstellung)-->
				<span><strong>Daily start of work:</strong></span>
				<div class="flex gap-4 m-2 mb-8">
					<input class="input text-center text-lg" type="time" bind:value={startTime} />
				</div>
			</div>
			<div>
				<!--Sollarbeitszeit-->
				<span><strong>Planned working time:</strong></span>
				<div class="flex gap-4 m-2 mb-8">
					<input class="input text-center text-lg" type="time" bind:value={plannedWorkingTime} />
				</div>
			</div>
		</section>
		<footer class="card-footer text-right">
			<button class="btn variant-filled-primary" on:click={() => saveSettings()}>Save</button>
		</footer>
	</div>
</div>
