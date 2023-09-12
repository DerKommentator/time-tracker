<script lang="ts">
	import { IconSettings, IconTrash } from '@tabler/icons-svelte';
	import type { Timeslot } from '$lib/models/Timeslot';
	import TimeInput from '$lib/components/TimeInput.svelte';
	import type { Time } from '$lib/models/Time';
	import { flip } from 'svelte/animate';
	import { sineInOut } from 'svelte/easing';
	import { fly, slide } from 'svelte/transition';
	import { settingsStore, timeslotStore } from '../stores/store';
	import { onMount } from 'svelte';
	import { Toast, getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';

	initializeStores();
	const toastStore = getToastStore();

	let startTime: string = formatTime($settingsStore.standardStartTime || { hours: 7, minutes: 30 });
	let endTime: string;
	let dateString: string = new Date().toISOString().split('T')[0];

	let inputError = false;
	let inputErrorLabel = '';
	//let trackedTimes: Array<Timeslot> = [];

	/*let trackedTimes: Array<Timeslot> = [
		{
			begin: { hours: 14, minutes: 20, seconds: 5 },
			end: { hours: 19, minutes: 10, seconds: 45 },
			date: new Date()
		},
		{
			begin: { hours: 8, minutes: 55, seconds: 14 },
			end: { hours: 12, minutes: 20, seconds: 32 },
			date: new Date()
		},
		{
			begin: { hours: 18, minutes: 36, seconds: 55 },
			end: { hours: 20, minutes: 23, seconds: 25 },
			date: new Date()
		}
	];*/

	const dateFormatDe = new Intl.DateTimeFormat('en-US', {
		dateStyle: 'medium'
	});

	function saveTime(): void {
		const startTimes = startTime.split(':');
		const endTimes = endTime.split(':');

		const start: Time = { hours: parseInt(startTimes[0]), minutes: parseInt(startTimes[1]) };
		const end: Time = { hours: parseInt(endTimes[0]), minutes: parseInt(endTimes[1]) };

		if (start.hours > end.hours || (start.hours == end.hours && start.minutes >= end.minutes)) {
			inputErrorLabel = 'Arbeitsbeginn muss vor dem Arbeitsende sein';
			return;
		}

		$timeslotStore = [
			{
				uuid: crypto.randomUUID(),
				begin: { hours: start.hours, minutes: start.minutes },
				end: { hours: end.hours, minutes: end.minutes },
				date: new Date(dateString)
			},
			...$timeslotStore
		];

		const toastSettings: ToastSettings = {
			message: 'Erfolgreich gesichert!',
			background: 'variant-filled-success'
		};
		toastStore.trigger(toastSettings);
	}

	function formatDate(date: Date): string {
		return (
			String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0')
		);
	}

	function formatTime(time: Time): string {
		return String(time.hours).padStart(2, '0') + ':' + String(time.minutes).padStart(2, '0');
	}

	function deleteTimeslot(index: number): void {
		$timeslotStore = [...$timeslotStore.slice(0, index), ...$timeslotStore.slice(index + 1)];
	}
</script>

<div class="relative">
	<Toast position="tr" />
	<div class="container min-w-full max-h-screen flex justify-between p-10">
		<div class="card p-4 self-baseline flex-none w-1/3">
			<header class="card-header text-xl"><strong>Hinzufügen:</strong></header>
			<section class="m-8">
				<div>
					<span><strong>Datum:</strong></span>
					<div class="flex gap-4 m-2 mb-8">
						<input class="input text-center text-lg" type="date" bind:value={dateString} />
					</div>
				</div>
				<div>
					<span><strong>Arbeitsbeginn:</strong></span>
					<div class="flex gap-4 m-2 mb-8">
						<input
							class="input text-center text-lg"
							class:input-error={inputErrorLabel}
							type="time"
							bind:value={startTime}
							on:input={() => {
								inputErrorLabel = '';
							}}
						/>
						<button
							class="btn variant-filled-primary"
							on:click={() => {
								startTime = formatDate(new Date());
							}}>Set current time</button
						>
					</div>
				</div>
				<div>
					<span><strong>Arbeitsende:</strong></span>
					<div class="flex gap-4 m-2 mb-8">
						<input
							class="input text-center text-lg"
							class:input-error={inputErrorLabel}
							type="time"
							min={startTime}
							bind:value={endTime}
							on:input={() => {
								inputErrorLabel = '';
							}}
						/>
						<button
							class="btn variant-filled-primary"
							on:click={() => {
								endTime = formatDate(new Date());
							}}>Set current time</button
						>
					</div>
				</div>
			</section>
			<footer class="card-footer flex items-center justify-between m-2 mt-12">
				{#if inputErrorLabel}
					<p class="text-red-600 text-sm"><b>Error: </b>{inputErrorLabel}</p>
				{:else}
					<p />
				{/if}
				<button class="btn variant-filled-primary" on:click={() => saveTime()}>Save</button>
			</footer>
		</div>

		<div
			class="flex flex-col justify-between overflow-y-scroll gap-y-5 h-[calc(100vh-9rem)] rounded w-1/2"
		>
			{#each $timeslotStore as tt, index (tt.uuid)}
				<div
					class="card p-4 flex-none w-1/2 ml-auto mr-0"
					animate:flip={{ delay: 100, duration: 200, easing: sineInOut }}
					in:fly={{ x: -1000, duration: 200, delay: 200 }}
				>
					<header class="card-header text-xl flex justify-between">
						<strong>
							<!--new Date() is necessery. Otherwise it would throw an exeption. Dont know why-->
							{String(new Date(tt.date).getDate()).padStart(2, '0')}.{String(
								new Date(tt.date).getMonth() + 1
							).padStart(2, '0')}.{new Date(tt.date).getFullYear()}
						</strong>
						<button class="btn variant-filled-surface" on:click={() => deleteTimeslot(index)}
							><IconTrash /></button
						>
					</header>
					<section class="m-8">
						<div>
							<span><strong>Arbeitsbeginn:</strong></span>
							<div class="flex gap-4 m-2 mb-8">
								<input class="input" type="time" value={formatTime(tt.begin)} disabled />
							</div>
						</div>
						<div>
							<span><strong>Arbeitsende:</strong></span>
							<div class="flex gap-4 m-2 mb-8">
								<input class="input" type="time" value={formatTime(tt.end)} disabled />
							</div>
						</div>
					</section>
				</div>
			{/each}
		</div>
	</div>
	<a class="absolute bottom-0 left-0 btn variant-filled-primary m-10" href="/settings">
		<IconSettings />
	</a>
</div>
