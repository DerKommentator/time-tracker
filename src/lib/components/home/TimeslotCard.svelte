<script lang="ts">
	import type { Timeslot } from '$lib/models/Timeslot';
	import { IconTrash } from '@tabler/icons-svelte';
	// import { statisticsStore } from '../../../stores/store';
	import { getToastStore, initializeStores, type ToastSettings } from '@skeletonlabs/skeleton';
	import {
		formatTimeWithLabels,
		formatDate,
		formatTime,
		compareDates
	} from '$lib/utils/HelperFunctions';
	import type { Time } from '$lib/models/Time';
	import { db } from '$lib/db/db';
	import type { DbError } from '$lib/models/DbError';
	import LL from '../../../i18n/i18n-svelte';
	import { onMount } from 'svelte';

	let databaseName: 'timeslots' | 'testTableTimeslots' = 'timeslots';
	export let isTestingMode: boolean = false;

	if ((window as any)?.APP_TESTING || isTestingMode) {
		initializeStores();
		databaseName = 'testTableTimeslots';
	}

	export let timeslot: Timeslot;
	export let id: string;
	let status: DbError = { text: '', cssColor: '' };

	const toastStore = getToastStore();

	function deleteTimeslot(timeToRemove: Time): void {
		try {
			db[databaseName]
				.where('uuid')
				.equals(id)
				.delete()
				.then(() => {
					status = { text: 'Deleted!', cssColor: 'variant-filled-success' };
					const toastSettings: ToastSettings = {
						message: status.text,
						background: status.cssColor
					};

					toastStore.trigger(toastSettings);

					if (compareDates(timeslot.date, new Date()) == 0) {
						(window as any).ipcRenderer.send('deleted-todays-entry');
					}
				});
		} catch (error) {
			status = { text: $LL.TIMECARD.ERROR_DELETED(), cssColor: 'variant-filled-error' };
			const toastSettings: ToastSettings = {
				message: status.text,
				background: status.cssColor
			};

			toastStore.trigger(toastSettings);
		}
		// $timeslotStore = [...$timeslotStore.slice(0, index), ...$timeslotStore.slice(index + 1)];

		// $statisticsStore.availableOvertime = calcTime(timeToRemove, $statisticsStore.availableOvertime);

		// const toastSettings: ToastSettings = {
		// 	message: status.text,
		// 	background: status.cssColor
		// };

		// toastStore.trigger(toastSettings);
	}

	onMount(() => {
		if ((window as any)?.IN_DESKTOP_ENV && compareDates(timeslot.date, new Date()) == 0) {
			(window as any).ipcRenderer.send('saved-todays-entry');
		}
	});
</script>

<header class="card-header text-xl flex justify-between items-center">
	<strong data-testid="timeslot-item-card-date">
		{formatDate(new Date(timeslot.date))}
	</strong>
	<button
		data-testid="timeslot-delete-btn"
		class="btn variant-filled-surface"
		on:click={() => deleteTimeslot(timeslot.statistics.timeDiffPlannedToWorked)}
		><IconTrash /></button
	>
</header>
<section class="mx-4 my-3">
	<div class="flex flex-row justify-around m-2">
		<div class="w-1/2 mr-4">
			<span class="inline-block mb-4"><strong>{$LL.TIMEINPUT.START_LABEL()}</strong></span>
			<input
				data-testid="timeslot-item-card-start-time"
				class="input"
				type="time"
				value={formatTime(timeslot.begin)}
				disabled
				aria-label="View: Start of Work"
			/>
		</div>
		<span class="divider-vertical h-24" />
		<div class="w-1/2 ml-4">
			<span class="inline-block mb-4"><strong>{$LL.TIMEINPUT.END_LABEL()}</strong></span>
			<input
				data-testid="timeslot-item-card-end-time"
				class="input"
				type="time"
				value={formatTime(timeslot.end)}
				disabled
				aria-label="View: End of Work"
			/>
		</div>
	</div>

	<div
		class="text-center text-sm font-semibold text-gray-200/80 mt-2"
		data-testid="timeslot-item-card-breaktime"
	>
		{$LL.TIMEINPUT.BREAKTIME_LABEL()}
		{formatTimeWithLabels(
			timeslot.breaktimePeriod,
			$LL.SHORT_HOURS_LABEL(),
			$LL.SHORT_MINUTES_LABEL()
		)}
	</div>
</section>
