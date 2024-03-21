<script lang="ts">
	import type { Timeslot } from '$lib/models/Timeslot';
	import { onMount } from 'svelte';
	import TimeGridCard from './TimeGridCard.svelte';
	import type { Time } from '$lib/models/Time';
	import { calcTime, formatOvertime, timeToMinutes } from '$lib/utils/HelperFunctions';
	// import { statisticsStore } from '../../../stores/store';
	import LL from '../../../i18n/i18n-svelte';

	export let data: Timeslot[] = [];

	let average = { avgStart: 0, avgEnd: 0, avgBreaktime: 0 };
	let median: { medianStart: Time; medianEnd: Time; medianBreaktime: Time } = {
		medianStart: { hours: 0, minutes: 0 },
		medianEnd: { hours: 0, minutes: 0 },
		medianBreaktime: { hours: 0, minutes: 0 }
	};
	let availableOvertime: Time = { hours: 0, minutes: 0 };

	function calcAverage(values: Timeslot[]): {
		avgStart: number;
		avgEnd: number;
		avgBreaktime: number;
	} {
		if (values.length == 0) {
			return { avgStart: 0, avgEnd: 0, avgBreaktime: 0 };
		}

		let sumStart: number = 0;
		let sumEnd: number = 0;
		let sumBreaktime: number = 0;

		values.forEach((timeslot) => {
			sumStart += timeToMinutes(timeslot.begin);
			sumEnd += timeToMinutes(timeslot.end);
			sumBreaktime += timeToMinutes(timeslot.breaktimePeriod);
		});

		return {
			avgStart: sumStart / values.length,
			avgEnd: sumEnd / values.length,
			avgBreaktime: sumBreaktime / values.length
		};
	}

	// TODO: OPTIMIZE
	function timeLGreaterR(lhs: Time, rhs: Time): number {
		if (lhs.hours === rhs.hours) {
			if (lhs.minutes === rhs.minutes) {
				return 0;
			} else {
				return lhs.minutes > rhs.minutes ? 1 : -1;
			}
		} else {
			return lhs.hours > rhs.hours ? 1 : -1;
		}
	}

	// TODO: OPTIMIZE
	function calcMedian(values: Timeslot[]): {
		medianStart: Time;
		medianEnd: Time;
		medianBreaktime: Time;
	} {
		if (values.length === 0) {
			return {
				medianStart: { hours: 0, minutes: 0 },
				medianEnd: { hours: 0, minutes: 0 },
				medianBreaktime: { hours: 0, minutes: 0 }
			};
		}

		// Sort by begin
		values.sort((lhs: Timeslot, rhs: Timeslot) => {
			return timeLGreaterR(lhs.begin, rhs.begin);
		});
		const medianStartSlot: Timeslot = values[Math.floor(values.length / 2)];

		// Sort by end
		values.sort((lhs: Timeslot, rhs: Timeslot) => {
			return timeLGreaterR(lhs.end, rhs.end);
		});
		const medianEndSlot: Timeslot = values[Math.floor(values.length / 2)];

		// Sort by breaktime
		values.sort((lhs: Timeslot, rhs: Timeslot) => {
			return timeLGreaterR(lhs.breaktimePeriod, rhs.breaktimePeriod);
		});
		const medianBreaktimeSlot: Timeslot = values[Math.floor(values.length / 2)];

		return {
			medianStart: medianStartSlot.begin,
			medianEnd: medianEndSlot.end,
			medianBreaktime: medianBreaktimeSlot.breaktimePeriod
		};
	}

	function calcAvailableOvertime(values: Timeslot[]): Time {
		let sumTime: Time = { hours: 0, minutes: 0 };
		values.forEach((timeslot) => {
			sumTime = calcTime(sumTime, timeslot.statistics.timeDiffPlannedToWorked, true);
		});
		return sumTime;
	}

	$: {
		// TODO: OPTIMIZE (save these values to reduze recalculation)
		average = calcAverage(data);
		median = calcMedian(data);
		availableOvertime = calcAvailableOvertime(data);
	}
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-1 m-2 mb-7">
	<TimeGridCard
		headline={$LL.STATISTICS.GRIDCARD.START_AVG()}
		displayText={average.avgStart}
		dataTestId="start-avg-card"
	/>
	<TimeGridCard
		headline={$LL.STATISTICS.GRIDCARD.BREAKTIME_AVG()}
		displayText={average.avgBreaktime}
		dataTestId="breaktime-avg-card"
	/>
	<TimeGridCard
		headline={$LL.STATISTICS.GRIDCARD.END_AVG()}
		displayText={average.avgEnd}
		dataTestId="end-avg-card"
	/>
	<TimeGridCard
		headline={$LL.STATISTICS.GRIDCARD.START_MEDIAN()}
		displayText={median.medianStart}
		dataTestId="start-median-card"
	/>
	<TimeGridCard
		headline={$LL.STATISTICS.GRIDCARD.BREAKTIME_MEDIAN()}
		displayText={median.medianBreaktime}
		dataTestId="breaktime-median-card"
	/>
	<TimeGridCard
		headline={$LL.STATISTICS.GRIDCARD.END_MEDIAN()}
		displayText={median.medianEnd}
		dataTestId="end-median-card"
	/>
	<TimeGridCard
		headline={$LL.STATISTICS.GRIDCARD.AVAILABLE_OVERTIME()}
		displayText={formatOvertime(availableOvertime)}
		dataTestId="aval-ot-card"
	/>
</div>
