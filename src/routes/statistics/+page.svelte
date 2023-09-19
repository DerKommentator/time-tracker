<script lang="ts">
	import { IconArrowBack } from '@tabler/icons-svelte';
	import { onMount } from 'svelte';
	import BarChart from '$lib/components/statistics/BarChart.svelte';
	import { timeToHours } from '$lib/utils/HelperFunctions';
	import DisplayGrid from '$lib/components/statistics/DisplayGrid.svelte';
	import Dexie, { liveQuery } from 'dexie';
	import { db } from '$lib/db/db';

	let data: { date: string; worked: number; avalOt: number }[];

	let timeslots = liveQuery(() => db.timeslots.toCollection().sortBy('date'));

	$: {
		if ($timeslots) {
			data = $timeslots.map((timeslot) => ({
				date: new Date(timeslot.date).toLocaleDateString(),
				worked: timeToHours(timeslot.statistics.hoursWorked),
				avalOt: timeToHours(timeslot.statistics.availableOvertime)
			}));
		}
	}
</script>

<div class="h-full">
	<a class="btn variant-filled-primary m-10" href="/">
		<IconArrowBack />
	</a>

	{#if $timeslots}
		<DisplayGrid data={$timeslots} />

		<div class="card p-4 mx-5 relative h-2/5 sm:h-1/2 lg:h-2/3">
			<BarChart {data} />
		</div>
	{/if}
</div>
