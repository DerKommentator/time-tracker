<script lang="ts">
	import type { Time } from '$lib/models/Time';
	import { formatTime, minutesToTime } from '$lib/utils/HelperFunctions';
	import { onMount } from 'svelte';

	export let dataTestId: string = '';
	export let headline: string;
	export let displayText: string | number | Time = '00:00';

	let formattedText: string;

	onMount(() => {
		if (typeof displayText === 'number') {
			formattedText = formatTime(minutesToTime(displayText));
		} else if (typeof displayText === 'string') {
			formattedText = displayText;
		} else {
			formattedText = formatTime(displayText);
		}
	});
</script>

<div class="card p-4" data-testid={dataTestId}>
	<p class="font-bold text-center" data-testid="headline">{headline}</p>
	<p class="text-2xl text-center" data-testid="displayText">{formattedText}</p>
</div>
