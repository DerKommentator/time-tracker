<script lang="ts">
	import { formatTime, minutesToTime } from '$lib/utils/HelperFunctions';
	import { IconClock, IconClockPlay, IconClockStop } from '@tabler/icons-svelte';
	import LL from '../../../i18n/i18n-svelte';

	export let dataTestId: string;
	export let label: string;
	export let inputError: boolean = false;
	export let time: string;
	export let minTimeLimit: string = '';
	export let disabled: boolean = false;

	let breaktimeStart: Date;
	let breaktimeEnd: Date;
	let lockBreaktimeEndButton: boolean = true;

	$: if (breaktimeEnd != null || breaktimeEnd != undefined) {
		let seconds = Math.abs(breaktimeEnd.valueOf() - breaktimeStart.valueOf());
		time = formatTime(minutesToTime(seconds / 60000));
	}
</script>

<span><strong>{label}</strong></span>
<div class="flex gap-4 m-2 mb-8 items-center">
	<input
		data-testid={dataTestId}
		class="input text-center text-lg w-full"
		class:input-error={inputError}
		aria-label="Enter {label}"
		type="time"
		{disabled}
		min={minTimeLimit}
		bind:value={time}
		on:input={() => {
			inputError = false;
		}}
	/>
	<div class="flex-1">
		<button
			data-testid="set-current-time-btn"
			class="btn variant-filled-primary mb-4 lg:w-44"
			{disabled}
			on:click={() => {
				breaktimeStart = new Date();
				lockBreaktimeEndButton = false;
			}}
			><IconClockPlay class="inline lg:hidden" /><span class="hidden lg:inline lg:!mx-0"
				>{$LL.TIMEINPUT.BREAKTIME_START()}</span
			></button
		>
		<button
			data-testid="set-current-time-btn"
			class="btn variant-filled-primary lg:w-44"
			disabled={lockBreaktimeEndButton || disabled}
			on:click={() => {
				breaktimeEnd = new Date();
				lockBreaktimeEndButton = true;
			}}
			><IconClockStop class="inline lg:hidden" /><span class="hidden lg:inline lg:!mx-0"
				>{$LL.TIMEINPUT.BREAKTIME_END()}</span
			></button
		>
	</div>
</div>
