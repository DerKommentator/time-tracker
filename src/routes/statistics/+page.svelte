<script lang="ts">
	import { IconArrowBack } from '@tabler/icons-svelte';
	import { onMount } from 'svelte';
	import BarChart from '$lib/components/statistics/BarChart.svelte';
	import { calcTime, timeToHours } from '$lib/utils/HelperFunctions';
	import DisplayGrid from '$lib/components/statistics/DisplayGrid.svelte';
	import Dexie, { liveQuery, type Observable } from 'dexie';
	import { db } from '$lib/db/db';
	import type { Time } from '$lib/models/Time';
	import type { Timeslot } from '$lib/models/Timeslot';

	let data: { date: string; worked: number; avalOt: number }[];

	let databaseName: 'timeslots' | 'testTableTimeslots' = 'timeslots';

	let fetchLimit: number = 20;
	let timeslotsSortByDate: Observable<Timeslot[]>;

	if ((window as any)?.APP_TESTING) {
		databaseName = 'testTableTimeslots';
	}

	$: if (fetchLimit > 0) {
		timeslotsSortByDate = liveQuery(() =>
			db[databaseName].toCollection().limit(fetchLimit).sortBy('date')
		);
	}

	$: if ($timeslotsSortByDate) {
		let overtimeSum: Time = { hours: 0, minutes: 0 };
		data = $timeslotsSortByDate.map((timeslot) => {
			overtimeSum = calcTime(overtimeSum, timeslot.statistics.timeDiffPlannedToWorked, true);
			return {
				date: new Date(timeslot.date).toLocaleDateString(),
				worked: timeToHours(timeslot.statistics.hoursWorked),
				breaktimePeriod: timeToHours(timeslot.breaktimePeriod),
				avalOt: timeToHours(overtimeSum)
			};
		});
	}

	// Clean Code
	const forceUpdate = async (render: any) => {};
</script>

<div id="statistics" class="h-full p-5">
	<!-- <a class="btn variant-filled-primary m-10" href="/" aria-label="Home">
		<IconArrowBack />
	</a> -->

	{#if $timeslotsSortByDate}
		<DisplayGrid data={$timeslotsSortByDate} />

		<div class="card p-4 mx-2 pb-72 sm:pb-40 relative h-2/5 sm:h-1/2 lg:h-2/3">
			{#key data}
				<BarChart {data} bind:fetchLimit />
			{/key}
		</div>
	{/if}
</div>
