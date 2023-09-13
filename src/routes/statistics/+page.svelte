<script lang="ts">
	import { IconArrowBack } from '@tabler/icons-svelte';
	import { onMount } from 'svelte';
	import { Chart } from 'chart.js/auto';
	let canvas: HTMLCanvasElement;

	let chart: Chart;

	function createPieChart(ctx: CanvasRenderingContext2D) {
		chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: ['group 1', 'group 2'],
				datasets: [
					{
						backgroundColor: '#ffffff',
						borderWidth: 3,
						label: 'test1',
						data: [1, 3]
					},
					{
						backgroundColor: '#00ff00',
						borderWidth: 3,
						label: 'test2',
						data: [1, 3]
					}
				]
			},
			options: {}
		});
	}

	onMount(() => {
		const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
		createPieChart(ctx);
	});
</script>

<div>
	<a class="btn variant-filled-primary m-10" href="/">
		<IconArrowBack />
	</a>

	<div class="card p-4 mx-5"><canvas bind:this={canvas}>{chart}</canvas></div>
</div>
