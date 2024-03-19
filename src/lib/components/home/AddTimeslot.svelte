<script context="module" lang="ts">
	import { get } from 'svelte/store';
	import { settingsStore } from '../../../stores/store';
	import { STARTUP_TIME } from '$lib/utils/Constants';

	let startTime: string =
		formatTime(get(settingsStore).standardStartTime) || formatTime({ hours: 7, minutes: 30 });

	if (STARTUP_TIME instanceof Date && get(settingsStore).useStartupTime) {
		startTime = formatDateToTime(STARTUP_TIME);
	}
</script>

<script lang="ts">
	import {
		calcTime,
		compareDates,
		formatDate,
		formatDateToTime,
		formatTime,
		stringToTime
	} from '$lib/utils/HelperFunctions';
	// import { statisticsStore } from '../../../stores/store';
	import { getToastStore, initializeStores, type ToastSettings } from '@skeletonlabs/skeleton';
	import type { Time } from '$lib/models/Time';
	import type { Timeslot } from '$lib/models/Timeslot';
	import type { Settings } from '$lib/models/Settings';
	import type { StatisticsStore } from '$lib/models/StatisticsStore';
	import { db } from '$lib/db/db';
	import type { DbError } from '$lib/models/DbError';
	import TimeInput from './TimeInput.svelte';
	import BreaktimeInput from './BreaktimeInput.svelte';
	import LL from '../../../i18n/i18n-svelte';
	import { onDestroy, onMount } from 'svelte';

	let databaseName: 'timeslots' | 'testTableTimeslots' = 'timeslots';

	export let isTestingMode: boolean = false;

	if ((window as any)?.APP_TESTING || isTestingMode) {
		// Has to be initilized in every component for component testing
		initializeStores();
		databaseName = 'testTableTimeslots';
	}

	const toastStore = getToastStore();

	//export let timeslots: Timeslot[];
	export let settings: Settings;
	// export let statistics: StatisticsStore;
	let endTime: string;
	let now: Date = new Date();
	let dateString: string = now.toISOString().split('T')[0];
	let lockSave: boolean = false;
	let breaktimePeriod: string = '00:40';

	let dateError: boolean = false;
	let startTimeError: boolean = false;
	let breaktimeError: boolean = false;
	let endTimeError: boolean = false;
	let errorMessage: string = '';

	// let status: DbError = { text: '', cssColor: '' };

	async function addTimeslotToDb(timeslot: Timeslot): Promise<DbError> {
		try {
			const id = await db[databaseName].add({
				uuid: timeslot.uuid,
				begin: timeslot.begin,
				breaktimePeriod: timeslot.breaktimePeriod,
				end: timeslot.end,
				date: timeslot.date,
				statistics: timeslot.statistics
			});

			return {
				text: $LL.TIMESLOT.TOAST_ADDED_SUCCESSFULLY({ date: formatDate(timeslot.date) }),
				cssColor: 'variant-filled-success'
			};
		} catch (error) {
			return {
				text: $LL.TIMESLOT.TOAST_ADDED_FAILED({
					date: formatDate(timeslot.date),
					error: (error as Error).message
				}),
				cssColor: 'variant-filled-error'
			};
		}
	}

	async function saveTime() {
		errorMessage = '';
		if (!endTime) {
			endTimeError = true;
			errorMessage = $LL.TIMESLOT.ERROR_END_MISSING();
			return;
		}

		let duplicates = await db[databaseName].where('date').equals(new Date(dateString)).count();

		if (duplicates > 0) {
			dateError = true;
			errorMessage = $LL.TIMESLOT.ERROR_ALREADY_EXIST();
			return;
		}

		const start: Time = stringToTime(startTime);
		const end: Time = stringToTime(endTime);

		if (start.hours > end.hours || (start.hours == end.hours && start.minutes >= end.minutes)) {
			startTimeError = true;
			endTimeError = true;
			errorMessage = $LL.TIMESLOT.ERROR_END_BEFORE_START();
			return;
		}

		const breaktime: Time = stringToTime(breaktimePeriod);
		let hoursWorked: Time = calcTime(start, end);
		hoursWorked = calcTime(breaktime, hoursWorked);
		let overtime: Time = calcTime(
			settings.plannedWorkingTime || { hours: 7, minutes: 30 },
			hoursWorked
		);

		// $statisticsStore.availableOvertime = calcTime(
		// 	$statisticsStore.availableOvertime || { hours: 0, minutes: 0 },
		// 	overtime,
		// 	true
		// );

		let newTimeslot: Timeslot = {
			uuid: crypto.randomUUID(),
			begin: { hours: start.hours, minutes: start.minutes },
			end: { hours: end.hours, minutes: end.minutes },
			breaktimePeriod: { hours: breaktime.hours, minutes: breaktime.minutes },
			date: new Date(dateString),
			statistics: {
				hoursWorked: hoursWorked,
				timeDiffPlannedToWorked: overtime
				// availableOvertime: $statisticsStore.availableOvertime
			}
		};

		const status = await addTimeslotToDb(newTimeslot);

		const toastSettings: ToastSettings = {
			message: status.text,
			background: status.cssColor
		};
		toastStore.trigger(toastSettings);

		if (compareDates(newTimeslot.date, now) == 0) {
			(window as any).ipcRenderer.send('saved-todays-entry');
		}
	}

	onMount(() => {
		if ((window as any)?.IN_DESKTOP_ENV) {
			(window as any).ipcRenderer.on('sendEvent-saveTime', async () => {
				const now = new Date();

				// Add 1 minute so the end time is always greater than the start time
				endTime = formatDateToTime(new Date(now.getTime() + 60000));
				await saveTime();

				//(window as any).ipcRenderer.send('trigger-close');
			});

			(window as any).ipcRenderer.on('sendEvent-exit', () => {
				(window as any).ipcRenderer.send('trigger-close');
			});

			(window as any).ipcRenderer.on('sendEvent-set-startTime', () => {
				startTime = formatDateToTime(new Date());
				dateString = new Date().toISOString().split('T')[0];
			});
		}
	});

	onDestroy(() => {
		if ((window as any)?.IN_DESKTOP_ENV) {
			(window as any).ipcRenderer.removeAllListeners('sendEvent-saveTime');
			(window as any).ipcRenderer.removeAllListeners('sendEvent-exit');
			(window as any).ipcRenderer.removeAllListeners('sendEvent-set-startTime');
		}
	});
</script>

<header class="card-header text-xl"><strong>{$LL.TIMESLOT.ADD_HEADLINE()}</strong></header>
<section class="m-8">
	<div>
		<span><strong>{$LL.TIMESLOT.DATE_LABEL()}</strong></span>
		<div class="flex gap-4 m-2 mb-8">
			<input
				data-testid="timeslot-datepicker"
				class="input text-center text-lg"
				class:input-error={errorMessage && dateError}
				aria-label="Enter Date"
				type="date"
				bind:value={dateString}
				on:input={() => {
					dateError = false;
				}}
			/>
		</div>
	</div>
	<div>
		<TimeInput
			dataTestId="start-time-input"
			label={$LL.TIMEINPUT.START_LABEL()}
			inputError={startTimeError}
			bind:time={startTime}
		/>
	</div>
	<div>
		<BreaktimeInput
			dataTestId="breaktime-input"
			label={$LL.TIMEINPUT.BREAKTIME_PERIOD_LABEL()}
			inputError={breaktimeError}
			bind:time={breaktimePeriod}
		/>
	</div>
	<div>
		<TimeInput
			dataTestId="end-time-input"
			label={$LL.TIMEINPUT.END_LABEL()}
			inputError={endTimeError}
			bind:time={endTime}
			minTimeLimit={startTime}
		/>
	</div>
</section>
<footer class="card-footer flex items-center justify-between m-2 mt-12">
	{#if errorMessage && (dateError || startTimeError || endTimeError || breaktimeError)}
		<p class="text-red-600 text-sm mr-12"><b>{$LL.ERROR_LABEL()} </b>{errorMessage}</p>
	{:else}
		<div />
	{/if}
	<button
		class="btn variant-filled-primary"
		data-testid="timeslot-save-btn"
		on:click={() => saveTime()}>{$LL.SAVE_LABEL()}</button
	>
</footer>
