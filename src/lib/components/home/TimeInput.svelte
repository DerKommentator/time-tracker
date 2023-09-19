<script lang="ts">
	import { formatDate } from '$lib/utils/HelperFunctions';
	import { IconClock } from '@tabler/icons-svelte';

	export let label: string;
	export let inputError: boolean;
	export let time: string;
	export let minTimeLimit: string = '';
</script>

<span><strong>{label}</strong></span>
<div class="flex gap-4 m-2 mb-8">
	<input
		class="input text-center text-lg"
		class:input-error={inputError}
		type="time"
		min={minTimeLimit}
		bind:value={time}
		on:input={() => {
			inputError = false;
		}}
	/>
	<button
		class="btn variant-filled-primary"
		on:click={() => {
			time = formatDate(new Date());
		}}
		><IconClock class="inline lg:hidden" /><span class="hidden lg:inline lg:!mx-0"
			>Set current time</span
		></button
	>
</div>
