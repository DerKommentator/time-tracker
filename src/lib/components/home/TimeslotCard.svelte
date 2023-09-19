<script lang="ts">
	import type { Timeslot } from '$lib/models/Timeslot';
	import { IconTrash } from '@tabler/icons-svelte';
	import { fly } from 'svelte/transition';
	import { statisticsStore, timeslotStore } from '../../../stores/store';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import { calcTime, formatTime } from '$lib/utils/HelperFunctions';
	import type { Time } from '$lib/models/Time';
	import { db } from '$lib/db/db';
	import { liveQuery } from 'dexie';
	import type { DbError } from '$lib/models/DbError';

	const toastStore = getToastStore();

	export let timeslot: Timeslot;
	export let id: string;
	let status: DbError = { text: '', cssColor: '' };

	function deleteTimeslot(timeToRemove: Time): void {
		try {
			db.timeslots
				.where('uuid')
				.equals(id)
				.delete()
				.then(() => (status = { text: 'Deleted!', cssColor: 'variant-filled-success' }));
		} catch (error) {
			status = { text: 'Failed to delete the timeslot!', cssColor: 'variant-filled-success' };
		}
		// $timeslotStore = [...$timeslotStore.slice(0, index), ...$timeslotStore.slice(index + 1)];

		$statisticsStore.availableOvertime = calcTime(timeToRemove, $statisticsStore.availableOvertime);

		const toastSettings: ToastSettings = {
			message: 'Deleted!',
			background: 'variant-filled-success'
		};

		toastStore.trigger(toastSettings);
	}
</script>

<header class="card-header text-xl flex justify-between">
	<strong>
		{new Date(timeslot.date).toLocaleDateString('de-DE', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		})}
	</strong>
	<button
		class="btn variant-filled-surface"
		on:click={() => deleteTimeslot(timeslot.statistics.timeDiffPlannedToWorked)}
		><IconTrash /></button
	>
</header>
<section class="m-4">
	<div>
		<div class="flex flex-row gap-4 m-2 mb-6">
			<div class="w-1/2">
				<span class="inline-block mb-4"><strong>Start of Work:</strong></span>
				<input class="input" type="time" value={formatTime(timeslot.begin)} disabled />
			</div>
			<span class="divider-vertical h-24" />
			<div class="w-1/2">
				<span class="inline-block mb-4"><strong>End of Work:</strong></span>
				<input class="input" type="time" value={formatTime(timeslot.end)} disabled />
			</div>
		</div>
	</div>
</section>
