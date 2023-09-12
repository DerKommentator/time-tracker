<script lang="ts">
	import type { Time } from '$lib/models/Time';
	import { IconArrowBack } from '@tabler/icons-svelte';
	import { settingsStore } from '../../stores/store';

	let startTime: string;

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
		const start: Time = { hours: parseInt(startTimes[0]), minutes: parseInt(startTimes[1]) };

		$settingsStore.standardStartTime = start;
	}
</script>

<div>
	<a class="btn variant-filled-primary m-10" href="/">
		<IconArrowBack />
	</a>

	<div class="card p-4 mx-auto w-1/2">
		<header class="card-header text-xl text-center"><strong>Einstellungen</strong></header>
		<section class="m-8">
			<div>
				<span><strong>Täglicher Arbeitsbeginn (Standardeinstellung)</strong></span>
				<div class="flex gap-4 m-2 mb-8">
					<input class="input text-center text-lg" type="time" bind:value={startTime} />
				</div>
			</div>
		</section>
		<footer class="card-footer text-right">
			<button class="btn variant-filled-primary" on:click={() => saveSettings()}>Save</button>
		</footer>
	</div>
</div>
