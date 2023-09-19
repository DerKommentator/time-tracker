<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart } from 'chart.js/auto';
	import { timeslotStore } from '../../../stores/store';
	import type { Time } from '$lib/models/Time';
	import { modeCurrent } from '@skeletonlabs/skeleton';
	import AddTimeslot from '../home/AddTimeslot.svelte';
	import type { Timeslot } from '$lib/models/Timeslot';

	let root = document.querySelector(":root [data-theme='skeleton']")!;
	let primaryColor = getComputedStyle(root).getPropertyValue('--color-primary-500');
	let tertiaryColor = getComputedStyle(root).getPropertyValue('--color-tertiary-500');
	// let errorColor = getComputedStyle(root).getPropertyValue('--color-error-700');
	let fontBase = getComputedStyle(root).getPropertyValue('--theme-font-color-base');
	let fontBaseDark = getComputedStyle(root).getPropertyValue('--theme-font-color-dark');
	let colorRed = '255, 43, 43';

	export let data: { date: string; worked: number; avalOt: number }[] = [];

	let canvas: HTMLCanvasElement;
	let chart: Chart;

	let innerWidth = 0;

	function createPieChart(ctx: CanvasRenderingContext2D) {
		// Shows an error but it's working perfectly :/
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
							if (!context.parsed) return `rgb(${tertiaryColor})`;

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
				maintainAspectRatio: false,
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

	// TODO: Optimize
	$: {
		if (chart) {
			if (innerWidth < 1024) {
				chart.options.aspectRatio = 1;
			} else {
				chart.options.aspectRatio = 2;
			}

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

<svelte:window bind:innerWidth />
<canvas bind:this={canvas}>{chart}</canvas>
