<script lang="ts">
	import { calcTime, formatDate, formatTime, stringToTime } from '$lib/utils/HelperFunctions';
	import { IconClock } from '@tabler/icons-svelte';
	import { settingsStore, statisticsStore, timeslotStore } from '../../../stores/store';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import type { Time } from '$lib/models/Time';
	import type { Timeslot } from '$lib/models/Timeslot';
	import type { Settings } from '$lib/models/Settings';
	import type { StatisticsStore } from '$lib/models/StatisticsStore';
	import { db } from '$lib/db/db';
	import type { DbError } from '$lib/models/DbError';
	import TimeInput from './TimeInput.svelte';

	const toastStore = getToastStore();

	//export let timeslots: Timeslot[];
	export let settings: Settings;
	export let statistics: StatisticsStore;

	let startTime: string = formatTime($settingsStore.standardStartTime || { hours: 7, minutes: 30 });
	let endTime: string;
	let now: Date = new Date();
	let dateString: string = now.toISOString().split('T')[0];

	let dateError: boolean = false;
	let startTimeError: boolean = false;
	let endTimeError: boolean = false;
	let errorMessage: string = '';

	let status: DbError = { text: '', cssColor: '' };

	async function addTimeslotToDb(timeslot: Timeslot) {
		try {
			const id = await db.timeslots.add({
				uuid: timeslot.uuid,
				begin: timeslot.begin,
				end: timeslot.end,
				date: timeslot.date,
				statistics: timeslot.statistics
			});

			status = {
				text: `Timeslot for ${formatDate(timeslot.date)} successfully added!`,
				cssColor: 'variant-filled-success'
			};
		} catch (error) {
			status = {
				text: `Failed to add timeslot for ${formatDate(timeslot.date)}: ${error}`,
				cssColor: 'variant-filled-error'
			};
		}
	}

	async function saveTime() {
		if (!endTime) {
			endTimeError = true;
			errorMessage = 'The end of work is missing!';
			return;
		}

		let duplicates = await db.timeslots.where('date').equals(new Date(dateString)).count();
		console.log(duplicates);
		if (duplicates > 0) {
			dateError = true;
			errorMessage = 'A timeslot for this date already exist!';
			return;
		}

		const start: Time = stringToTime(startTime);
		const end: Time = stringToTime(endTime);

		if (start.hours > end.hours || (start.hours == end.hours && start.minutes >= end.minutes)) {
			startTimeError = true;
			endTimeError = true;
			errorMessage = 'The start of work must be before the end of work!';
			return;
		}

		let hoursWorked: Time = calcTime(start, end);
		let overtime: Time = calcTime(
			settings.plannedWorkingTime || { hours: 7, minutes: 30 },
			hoursWorked
		);

		$statisticsStore.availableOvertime = calcTime(
			statistics.availableOvertime || { hours: 0, minutes: 0 },
			overtime,
			true
		);

		let newTimeslot: Timeslot = {
			uuid: crypto.randomUUID(),
			begin: { hours: start.hours, minutes: start.minutes },
			end: { hours: end.hours, minutes: end.minutes },
			date: new Date(dateString),
			statistics: {
				hoursWorked: hoursWorked,
				timeDiffPlannedToWorked: overtime,
				availableOvertime: $statisticsStore.availableOvertime
			}
		};

		await addTimeslotToDb(newTimeslot);

		const toastSettings: ToastSettings = {
			message: status.text,
			background: status.cssColor
		};
		toastStore.trigger(toastSettings);

		//(window as any).api.notification(['Hallo', 'TestBody']);
	}
</script>

<header class="card-header text-xl"><strong>Add manually:</strong></header>
<section class="m-8">
	<div>
		<span><strong>Date:</strong></span>
		<div class="flex gap-4 m-2 mb-8">
			<input
				class="input text-center text-lg"
				class:input-error={errorMessage && dateError}
				type="date"
				bind:value={dateString}
				on:input={() => {
					dateError = false;
				}}
			/>
		</div>
	</div>
	<div>
		<TimeInput label={'Start of Work:'} inputError={startTimeError} bind:time={startTime} />
	</div>
	<div>
		<TimeInput
			label={'End of Work:'}
			inputError={endTimeError}
			bind:time={endTime}
			minTimeLimit={startTime}
		/>
	</div>
</section>
<footer class="card-footer flex items-center justify-between m-2 mt-12">
	{#if errorMessage && (dateError || startTimeError || endTimeError)}
		<p class="text-red-600 text-sm mr-12"><b>Error: </b>{errorMessage}</p>
	{:else}
		<p />
	{/if}
	<button class="btn variant-filled-primary" on:click={() => saveTime()}>Save</button>
</footer>
