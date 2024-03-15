<script lang="ts">
	import { IconArrowBack } from '@tabler/icons-svelte';
	import { onMount } from 'svelte';
	import BarChart from '$lib/components/statistics/BarChart.svelte';
	import { calcTime, timeToHours } from '$lib/utils/HelperFunctions';
	import DisplayGrid from '$lib/components/statistics/DisplayGrid.svelte';
	import Dexie, { liveQuery } from 'dexie';
	import { db } from '$lib/db/db';
	import type { Time } from '$lib/models/Time';

	let data: { date: string; worked: number; avalOt: number }[];

	let databaseName: 'timeslots' | 'testTableTimeslots' = 'timeslots';

	if ((window as any)?.APP_TESTING) {
		databaseName = 'testTableTimeslots';
	}

	let timeslotsSortByDate = liveQuery(() => db[databaseName].toCollection().sortBy('date'));

	$: {
		if ($timeslotsSortByDate) {
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
	}
</script>

<div id="statistics" class="h-full p-5">
	<!-- <a class="btn variant-filled-primary m-10" href="/" aria-label="Home">
		<IconArrowBack />
	</a> -->

	{#if $timeslotsSortByDate}
		<DisplayGrid data={$timeslotsSortByDate} />

		<div class="card p-4 mx-2 pb-32 relative h-2/5 sm:h-1/2 lg:h-2/3">
			<BarChart {data} />
		</div>
	{/if}
</div>
