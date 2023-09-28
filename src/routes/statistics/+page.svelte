<script lang="ts">
	import { IconArrowBack } from '@tabler/icons-svelte';
	import { onMount } from 'svelte';
	import BarChart from '$lib/components/statistics/BarChart.svelte';
	import { timeToHours } from '$lib/utils/HelperFunctions';
	import DisplayGrid from '$lib/components/statistics/DisplayGrid.svelte';
	import Dexie, { liveQuery } from 'dexie';
	import { db } from '$lib/db/db';

	let data: { date: string; worked: number; avalOt: number }[];

	let timeslotsSortByDate = liveQuery(() => db.timeslots.toCollection().sortBy('date'));

	$: {
		if ($timeslotsSortByDate) {
			data = $timeslotsSortByDate.map((timeslot) => ({
				date: new Date(timeslot.date).toLocaleDateString(),
				worked: timeToHours(timeslot.statistics.hoursWorked),
				avalOt: timeToHours(timeslot.statistics.availableOvertime)
			}));
		}
	}
</script>

<div class="h-full p-5">
	<!-- <a class="btn variant-filled-primary m-10" href="/" aria-label="Home">
		<IconArrowBack />
	</a> -->

	{#if $timeslotsSortByDate}
		<DisplayGrid data={$timeslotsSortByDate} />

		<div class="card p-4 mx-2 relative h-2/5 sm:h-1/2 lg:h-2/3">
			<BarChart {data} />
		</div>
	{/if}
</div>
