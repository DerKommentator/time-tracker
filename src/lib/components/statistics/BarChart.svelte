<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart } from 'chart.js/auto';
	import 'chartjs-adapter-moment';
	import { SlideToggle, modeCurrent } from '@skeletonlabs/skeleton';
	import LL from '../../../i18n/i18n-svelte';
	import { ResizeObserver as ResizeObserverPolyfill } from '@juggle/resize-observer';
	import {
		formatStringToDate,
		formatTimeWithLabels,
		minutesToTime
	} from '$lib/utils/HelperFunctions';
	import { IconFilterOff } from '@tabler/icons-svelte';
	import type { Time } from '$lib/models/Time';

	if (typeof window !== 'undefined') {
		window.ResizeObserver = window.ResizeObserver || ResizeObserverPolyfill;
	}

	// let root = document.querySelector(":root [data-theme='skeleton']")!;
	// let primaryColor = getComputedStyle(root).getPropertyValue('--color-primary-500');
	// let tertiaryColor = getComputedStyle(root).getPropertyValue('--color-tertiary-500');
	// // let errorColor = getComputedStyle(root).getPropertyValue('--color-error-700');
	// let fontBase = getComputedStyle(root).getPropertyValue('--theme-font-color-base');
	// let fontBaseDark = getComputedStyle(root).getPropertyValue('--theme-font-color-dark');
	let primaryColor = '15, 186, 129';
	let secondaryColor = '211, 209, 249';
	let surfaceColor = '36, 44, 70';
	let tertiaryColor = '14, 165, 233';
	let fontBase = '0, 0, 0';
	let fontBaseDark = '255, 255, 255';
	let colorRed = '255, 43, 43';

	export let fetchLimit: number = 20;
	export let data: { date: Date; worked: number; avalOt: number; isFlexitimeDay: number }[] = [];
	const possibleRenderItems: number[] = [5, 10, 20, 30, 40, 50];
	let chartData = data.slice();

	let canvas: HTMLCanvasElement;
	let chart: Chart;
	let ctx: CanvasRenderingContext2D;

	let innerWidth = 0;

	const now: string = new Date().toISOString().split('T')[0];
	let firstTimeslotDate: string;
	let beginDateString: string;
	let endDateString: string;
	let dateError: boolean = false;
	let errorMessage: string = '';
	let lockDatePicker: boolean = true;
	let showFlexitimeDays: boolean = false;

	const flexitimeDayData: any = {
		label: 'EGZ',
		data: chartData,
		backgroundColor: `rgba(150, 0, 0, 0.3)`,
		parsing: {
			xAxisKey: 'date',
			yAxisKey: 'isFlexitimeDay'
		}
	};

	function generateDataWithDateRange() {
		if (beginDateString && endDateString) {
			const beginDate = new Date(beginDateString).getTime();
			const endDate = new Date(endDateString).getTime();

			chartData = data.filter((ts) => {
				return ts.date.getTime() >= beginDate && ts.date.getTime() <= endDate;
			});

			chart.destroy();
			chartData = chartData;
			createBarChart(ctx);
		}
	}

	function clearDateRangeFilter() {
		if (chart) {
			chart.destroy();
			chartData = data;
			createBarChart(ctx);
			lockDatePicker = true;
			beginDateString = '';
			endDateString = '';
		}
	}

	function createBarChart(ctx: CanvasRenderingContext2D) {
		// Workaround: Shows an error but it's working perfectly :/
		// @ts-ignore
		chart = new Chart(ctx, {
			type: 'bar',
			data: {
				datasets: [
					{
						label: $LL.STATISTICS.BARCHART.LEGEND_LABEL_WORKED(),
						data: chartData,
						backgroundColor: `rgb(${primaryColor})`,
						parsing: {
							xAxisKey: 'date',
							yAxisKey: 'worked'
						}
					},
					{
						label: $LL.STATISTICS.BARCHART.LEGEND_LABEL_BREAKTIME(),
						data: chartData,
						backgroundColor: `rgb(${secondaryColor})`,
						parsing: {
							xAxisKey: 'date',
							yAxisKey: 'breaktimePeriod'
						}
					},
					{
						label: $LL.STATISTICS.BARCHART.LEGEND_LABEL_AVAL_OVERTIME(),
						data: chartData,
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
				plugins: {
					legend: {
						labels: {
							boxWidth: 40,
							boxHeight: 15,
							generateLabels: function (chart) {
								let labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);

								const grad = ctx.createLinearGradient(50, 0, 1000, 450);
								grad.addColorStop(0.49, `rgb(${tertiaryColor})`);
								grad.addColorStop(0.505, `rgb(${colorRed})`);

								for (var key in labels) {
									if (key == '2') {
										labels[key].fillStyle = grad;
									}
								}
								return labels;
							}
						}
					},
					tooltip: {
						// filter: function (tooltip) {
						// 	return !tooltip.dataset.label?.includes('EGZ');
						// },
						callbacks: {
							label: function (context) {
								if (context.dataset.label == 'EGZ') return 'EGZ Day';

								let label = context.dataset.label || '';

								if (label) {
									label += ': ';
								}
								if (context.parsed.y !== null) {
									const time: Time = minutesToTime(context.parsed.y * 60);
									label += formatTimeWithLabels(
										time,
										$LL.SHORT_HOURS_LABEL(),
										$LL.SHORT_MINUTES_LABEL()
									);
								}
								return label;
							}
						}
					}
				},
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					x: {
						stacked: true,
						type: 'timeseries',
						time: {
							unit: 'day',
							tooltipFormat: 'DD.MM.YYYY',
							round: 'day',
							displayFormats: {
								day: 'DD.MM.YYYY'
							}
						},
						ticks: {
							source: 'data',
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
		ctx = canvas?.getContext('2d') as CanvasRenderingContext2D;

		chartData = data.filter((ob) => !ob.isFlexitimeDay);
		// console.log(chartData);
		createBarChart(ctx);

		if (chartData[0]) {
			firstTimeslotDate = chartData[0].date.toISOString().split('T')[0];
		}
	});

	// TODO: Optimize
	$: if (chart) {
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

	function addFlexitimeToChart(showFlexitimeDays: boolean) {
		if (showFlexitimeDays) {
			chart.data.datasets.push(flexitimeDayData);
		} else {
			chart.data.datasets = chart.data.datasets.filter((data) => data.label != 'EGZ');
		}
		chart.update();
	}
</script>

<svelte:window bind:innerWidth />

<div class="flex flex-col sm:flex-row sm:items-center gap-x-4 mb-8 justify-between">
	<div class="flex flex-row items-center">
		<span><strong>{$LL.STATISTICS.BARCHART.SHOW_FLEXITIME_DAYS()}</strong></span>
		<SlideToggle
			name="slide"
			active="bg-primary-500"
			data-testid="batchart-show-flexiday-toggle"
			size="md"
			class="m-2"
			bind:checked={showFlexitimeDays}
			on:change={() => addFlexitimeToChart(showFlexitimeDays)}
		/>
	</div>
	{#if errorMessage && dateError}
		<p class="text-red-600 text-sm"><b>{$LL.ERROR_LABEL()} </b>{errorMessage}</p>
	{/if}
	<div class="flex flex-col sm:flex-row sm:items-center gap-x-4">
		<button
			class="btn-icon variant-filled mb-4 sm:mb-0 ml-auto"
			on:click={() => clearDateRangeFilter()}
		>
			<IconFilterOff />
		</button>
		<!-- <span class="mr-12"><strong>Date Range:</strong></span> -->
		<div class="flex flex-col sm:flex-row sm:items-center gap-x-4">
			<!-- <span class="text-sm"><strong>Start:</strong></span> -->
			<input
				data-testid="begin-date-range-picker"
				class="input text-center dark:[-webkit-text-fill-color:white] [-webkit-text-fill-color:black]"
				class:input-error={errorMessage && dateError}
				aria-label="Enter First Date"
				type="date"
				min={firstTimeslotDate}
				max={now}
				bind:value={beginDateString}
				on:input={() => {
					dateError = false;
					lockDatePicker = false;
					generateDataWithDateRange();
				}}
			/>
			<span class="text-center"><strong>-</strong></span>
			<div class="flex flex-col items-center">
				<!-- <span class="text-sm"><strong>Ende:</strong></span> -->
				<input
					data-testid="end-date-range-picker"
					class="input text-center dark:[-webkit-text-fill-color:white] [-webkit-text-fill-color:black]"
					class:input-error={errorMessage && dateError}
					aria-label="Enter Last Date"
					type="date"
					min={beginDateString || firstTimeslotDate}
					max={now}
					disabled={lockDatePicker}
					bind:value={endDateString}
					on:input={() => {
						dateError = false;
						generateDataWithDateRange();
					}}
				/>
			</div>
		</div>
	</div>
</div>

<canvas bind:this={canvas} data-testid="barchart-canvas">{chart}</canvas>

<div class="flex flex-row items-center mt-4 gap-x-2 float-right">
	<span><strong>{$LL.STATISTICS.BARCHART.SHOW_ITEMS_LABEL()}</strong></span>
	<select class="select m-2 w-24" data-testid="settings-lang-select" bind:value={fetchLimit}>
		{#each possibleRenderItems as pNumber}
			<option value={pNumber}>{pNumber}</option>
		{/each}
	</select>
</div>
