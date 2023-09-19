<script lang="ts">
	import type { Timeslot } from '$lib/models/Timeslot';
	import { onMount } from 'svelte';
	import TimeGridCard from './TimeGridCard.svelte';
	import type { Time } from '$lib/models/Time';
	import { timeToMinutes } from '$lib/utils/HelperFunctions';

	export let data: Timeslot[] = [];

	let average = { avgStart: 0, avgEnd: 0 };
	let median: { medianStart: Time; medianEnd: Time } = {
		medianStart: { hours: 0, minutes: 0 },
		medianEnd: { hours: 0, minutes: 0 }
	};

	function calcAverage(values: Timeslot[]): { avgStart: number; avgEnd: number } {
		let sumStart: number = 0;
		let sumEnd: number = 0;

		values.forEach((timeslot) => {
			sumStart += timeToMinutes(timeslot.begin);
			sumEnd += timeToMinutes(timeslot.end);
		});

		return { avgStart: sumStart / values.length, avgEnd: sumEnd / values.length };
	}

	// TODO: OPTIMIZE
	function timeLGreaterR(lhs: Time, rhs: Time): number {
		if (lhs.hours > rhs.hours || (lhs.hours == rhs.hours && lhs.minutes >= rhs.minutes)) return 1;
		else if (lhs.hours < rhs.hours || (lhs.hours == rhs.hours && lhs.minutes <= rhs.minutes))
			return -1;
		else return 0;
	}

	// TODO: OPTIMIZE
	function calcMedian(values: Timeslot[]): { medianStart: Time; medianEnd: Time } {
		values.slice().sort((lhs: Timeslot, rhs: Timeslot) => {
			return timeLGreaterR(lhs.begin, rhs.begin);
		});
		let medianStartSlot = values[Math.ceil(values.length / 2)];

		values.slice().sort((lhs: Timeslot, rhs: Timeslot) => {
			return timeLGreaterR(lhs.end, rhs.end);
		});
		let medianEndSlot = values[Math.ceil(values.length / 2)];

		return { medianStart: medianStartSlot.begin, medianEnd: medianEndSlot.end };
	}

	$: {
		// TODO: OPTIMIZE
		average = calcAverage(data);
		median = calcMedian(data);
	}
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-1 mx-5 mb-5">
	<TimeGridCard headline="Ankunftsszeit Durchschnitt:" displayText={average.avgStart} />
	<TimeGridCard headline="Abfahrtsszeit Durchschnitt:" displayText={average.avgEnd} />
	<TimeGridCard headline="Ankunftszeit Median:" displayText={median.medianStart} />
	<TimeGridCard headline="Abfahrtsszeit Median:" displayText={median.medianEnd} />
</div>
