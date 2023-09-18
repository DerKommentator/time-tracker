<script lang="ts">
	import { IconCheck, IconClock, IconSettings, IconTrash } from '@tabler/icons-svelte';
	import type { Timeslot } from '$lib/models/Timeslot';
	import TimeInput from '$lib/components/TimeInput.svelte';
	import type { Time } from '$lib/models/Time';
	import { flip } from 'svelte/animate';
	import { sineInOut } from 'svelte/easing';
	import { fly, slide } from 'svelte/transition';
	import { settingsStore, statisticsStore, timeslotStore } from '../stores/store';
	import { onMount } from 'svelte';
	import { Toast, getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';

	initializeStores();
	const toastStore = getToastStore();

	let startTime: string = formatTime($settingsStore.standardStartTime || { hours: 7, minutes: 30 });
	let endTime: string;
	let dateString: string = new Date().toISOString().split('T')[0];

	let topInputError: boolean = false;
	let bottomInputError: boolean = false;
	let inputErrorLabel: string = '';

	let switchRespnsiveDesign: boolean;
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

	function calcTime(start: Time, end: Time, addition: boolean = false): Time {
		let startTimeInMin: number = start.hours * 60 + start.minutes;
		let endTimeInMin: number = end.hours * 60 + end.minutes;

		if (addition) {
			startTimeInMin *= -1;
		}
		let diff: number = endTimeInMin - startTimeInMin;
		let hours: number = Math.trunc(diff / 60);
		let remainder: number = (diff / 60) % 1;
		let minutes: number = remainder * 60;

		return { hours: hours, minutes: parseInt(minutes.toFixed(0)) };
	}

	// function sumTimes(first: Time, second: Time): Time {
	// 	let sumTimes: Time = { hours: 0, minutes: 0 };
	// 	sumTimes.hours = first.hours + second.hours;
	// 	sumTimes.minutes = first.minutes + second.minutes;

	// 	if (sumTimes.minutes >= 60) {
	// 		sumTimes.hours += 1;
	// 		sumTimes.minutes -= 60;
	// 	}

	// 	return sumTimes;
	// }

	function saveTime(): void {
		if (!endTime) {
			bottomInputError = true;
			inputErrorLabel = 'The end of the work is missing';
			return;
		}

		const startTimes = startTime.split(':');
		const endTimes = endTime.split(':');

		const start: Time = { hours: parseInt(startTimes[0]), minutes: parseInt(startTimes[1]) };
		const end: Time = { hours: parseInt(endTimes[0]), minutes: parseInt(endTimes[1]) };

		if (start.hours > end.hours || (start.hours == end.hours && start.minutes >= end.minutes)) {
			topInputError = true;
			bottomInputError = true;
			inputErrorLabel = 'The start of the work must be before the end of the work';
			return;
		}

		let hoursWorked: Time = calcTime(start, end);
		let overtime: Time = calcTime(
			$settingsStore.plannedWorkingTime || { hours: 7, minutes: 30 },
			hoursWorked
		);

		$statisticsStore.availableOvertime = calcTime(
			$statisticsStore.availableOvertime || { hours: 0, minutes: 0 },
			overtime,
			true
		);

		// TODO: Sortieren beim speichern
		$timeslotStore = [
			{
				uuid: crypto.randomUUID(),
				begin: { hours: start.hours, minutes: start.minutes },
				end: { hours: end.hours, minutes: end.minutes },
				date: new Date(dateString),
				statistics: {
					hoursWorked: hoursWorked,
					timeDiffPlannedToWorked: overtime,
					availableOvertime: $statisticsStore.availableOvertime
				}
			},
			...$timeslotStore
		];

		const toastSettings: ToastSettings = {
			message: 'Saved!',
			background: 'variant-filled-success'
		};
		toastStore.trigger(toastSettings);

		//(window as any).api.notification(['Hallo', 'TestBody']);
	}

	function formatDate(date: Date): string {
		return (
			String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0')
		);
	}

	function formatTime(time: Time): string {
		return String(time.hours).padStart(2, '0') + ':' + String(time.minutes).padStart(2, '0');
	}

	function deleteTimeslot(index: number, timeToRemove: Time): void {
		$timeslotStore = [...$timeslotStore.slice(0, index), ...$timeslotStore.slice(index + 1)];

		$statisticsStore.availableOvertime = calcTime(timeToRemove, $statisticsStore.availableOvertime);

		const toastSettings: ToastSettings = {
			message: 'Deleted!',
			background: 'variant-filled-success'
		};
		toastStore.trigger(toastSettings);
	}
</script>

<div class="relative">
	<Toast position="tr" />
	<div
		class="container min-w-full flex justify-between p-4 lg:p-8 flex-col lg:flex-row lg:max-h-screen"
	>
		<div class="card p-4 flex-none self-center lg:self-baseline xl:w-1/3">
			<header class="card-header text-xl"><strong>Add manually:</strong></header>
			<section class="m-8">
				<div>
					<span><strong>Date:</strong></span>
					<div class="flex gap-4 m-2 mb-8">
						<input class="input text-center text-lg" type="date" bind:value={dateString} />
					</div>
				</div>
				<div>
					<span><strong>Start of Work:</strong></span>
					<div class="flex gap-4 m-2 mb-8">
						<input
							class="input text-center text-lg"
							class:input-error={inputErrorLabel && topInputError}
							type="time"
							bind:value={startTime}
							on:input={() => {
								inputErrorLabel = '';
								topInputError = false;
							}}
						/>
						<button
							class="btn variant-filled-primary"
							on:click={() => {
								startTime = formatDate(new Date());
							}}
						>
							<IconClock class="inline lg:hidden" /><span class="hidden lg:inline lg:!mx-0"
								>Set current time</span
							>
						</button>
					</div>
				</div>
				<div>
					<span><strong>End of Work:</strong></span>
					<div class="flex gap-4 m-2 mb-8">
						<input
							class="input text-center text-lg"
							class:input-error={inputErrorLabel && bottomInputError}
							type="time"
							min={startTime}
							bind:value={endTime}
							on:input={() => {
								inputErrorLabel = '';
								bottomInputError = false;
							}}
						/>
						<button
							class="btn variant-filled-primary"
							on:click={() => {
								endTime = formatDate(new Date());
							}}
							><IconClock class="inline lg:hidden" /><span class="hidden lg:inline lg:!mx-0"
								>Set current time</span
							></button
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
			class="flex flex-col overflow-y-scroll h-[calc(100vh-9rem)] rounded self-center lg:self-auto lg:w-1/2 justify-around lg:justify-between mt-5 lg:mt-0"
		>
			<div class="flex flex-col gap-y-5 min-h-0">
				{#each $timeslotStore as tt, index (tt.uuid)}
					<div
						class="card p-4 flex-none ml-auto mr-0 lg:w-2/3"
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
							<button
								class="btn variant-filled-surface"
								on:click={() => deleteTimeslot(index, tt.statistics.timeDiffPlannedToWorked)}
								><IconTrash /></button
							>
						</header>
						<section class="m-8">
							<div>
								<span><strong>Start of Work:</strong></span>
								<div class="flex gap-4 m-2 mb-8">
									<input class="input" type="time" value={formatTime(tt.begin)} disabled />
								</div>
							</div>
							<div>
								<span><strong>End of Work:</strong></span>
								<div class="flex gap-4 m-2 mb-8">
									<input class="input" type="time" value={formatTime(tt.end)} disabled />
								</div>
							</div>
						</section>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
