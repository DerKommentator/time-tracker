<script lang="ts">
	import { formatDateToTime } from '$lib/utils/HelperFunctions';
	import { IconClock } from '@tabler/icons-svelte';
	import LL from '../../../i18n/i18n-svelte';

	export let dataTestId: string;
	export let label: string;
	export let inputError: boolean;
	export let time: string;
	export let minTimeLimit: string = '';
</script>

<span><strong>{label}</strong></span>
<div class="flex gap-4 m-2 mb-8">
	<input
		data-testid={dataTestId}
		class="input text-center text-lg"
		class:input-error={inputError}
		aria-label="Enter {label}"
		type="time"
		min={minTimeLimit}
		bind:value={time}
		on:input={() => {
			inputError = false;
		}}
	/>
	<button
		data-testid="set-current-time-btn"
		class="btn variant-filled-primary"
		on:click={() => {
			time = formatDateToTime(new Date());
		}}
		><IconClock class="inline lg:hidden" /><span class="hidden lg:inline lg:!mx-0"
			>{$LL.TIMEINPUT.SET_CURRENT_TIME_LABEL()}</span
		></button
	>
</div>
