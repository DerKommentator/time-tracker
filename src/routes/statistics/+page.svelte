<script lang="ts">
	import { IconArrowBack } from '@tabler/icons-svelte';
	import { onMount } from 'svelte';
	import { Chart, type ChartData, type ScriptableContext } from 'chart.js/auto';
	import { settingsStore, timeslotStore } from '../../stores/store';
	import type { Time } from '$lib/models/Time';
	import { modeCurrent } from '@skeletonlabs/skeleton';
	import Layout from '../+layout.svelte';

	let canvas: HTMLCanvasElement;
	let chart: Chart;

	function timeToHours(time: Time): number {
		return parseFloat((time.hours + time.minutes / 60).toFixed(2));
	}

	function timeToMinutes(time: Time): number {
		return time.hours * 60 + time.minutes;
	}

	const data = $timeslotStore
		.map((timeslot, index) => ({
			date: new Date(timeslot.date).toLocaleDateString(),
			worked: timeToHours(timeslot.statistics.hoursWorked),
			avalOt: timeToHours(timeslot.statistics.availableOvertime)
		}))
		.reverse();

	let root = document.querySelector(":root [data-theme='skeleton']")!;
	let primaryColor = getComputedStyle(root).getPropertyValue('--color-primary-500');
	let tertiaryColor = getComputedStyle(root).getPropertyValue('--color-tertiary-500');
	let errorColor = getComputedStyle(root).getPropertyValue('--color-error-700');
	let fontBase = getComputedStyle(root).getPropertyValue('--theme-font-color-base');
	let fontBaseDark = getComputedStyle(root).getPropertyValue('--theme-font-color-dark');
	let colorRed = '255, 43, 43';

	function createPieChart(ctx: CanvasRenderingContext2D) {
		// Shows an error but is working perfectly :/
		// @ts-ignore
		chart = new Chart(ctx, {
			type: 'bar',
			data: {
				datasets: [
					{
						label: 'Worked Hours (in Hours)',
						data: data,
						backgroundColor: `rgb(${primaryColor})`,
						parsing: {
							xAxisKey: 'date',
							yAxisKey: 'worked'
						}
					},
					{
						label: 'Available Overtime (in Hours)',
						data: data,
						backgroundColor: function (context) {
							if (context.parsed.y > 0) {
								return `rgb(${tertiaryColor})`;
							} else {
								return `rgb(${colorRed})`;
							}
						},
						parsing: {
							xAxisKey: 'date',
							yAxisKey: 'avalOt'
						}
					}
				]
			},
			options: {
				responsive: true,
				scales: {
					x: {
						stacked: true,
						ticks: {
							color: `rgb(${fontBaseDark})`
						}
					},
					y: {
						stacked: true,
						ticks: {
							color: `rgb(${fontBaseDark})`
						}
					}
				},
				color: `rgb(${fontBase})`
			}
		});
	}

	onMount(() => {
		const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D;
		createPieChart(ctx);
	});

	$: {
		if (chart) {
			if ($modeCurrent) {
				chart.options.scales!.x!.ticks!.color = `rgb(${fontBase})`;
				chart.options.scales!.y!.ticks!.color = `rgb(${fontBase})`;
				// chart.options.scales!.x!.grid!.color = `rgb(${fontBase})`;
				// chart.options.scales!.y!.grid!.color = `rgb(${fontBase})`;
				chart.options.color = `rgb(${fontBase})`;
			} else {
				chart.options.scales!.x!.ticks!.color = `rgb(${fontBaseDark})`;
				chart.options.scales!.y!.ticks!.color = `rgb(${fontBaseDark})`;
				// chart.options.scales!.x!.grid!.color = `rgb(${fontBaseDark})`;
				// chart.options.scales!.y!.grid!.color = `rgb(${fontBaseDark})`;
				chart.options.color = `rgb(${fontBaseDark})`;
			}

			chart.update();
		}
	}
</script>

<div>
	<a class="btn variant-filled-primary m-10" href="/">
		<IconArrowBack />
	</a>

	<div class="card p-4 mx-5"><canvas bind:this={canvas}>{chart}</canvas></div>
</div>
