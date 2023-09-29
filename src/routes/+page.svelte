<script lang="ts">
	import { flip } from 'svelte/animate';
	import { sineInOut } from 'svelte/easing';
	import { settingsStore, statisticsStore } from '../stores/store';
	import TimeslotCard from '$lib/components/home/TimeslotCard.svelte';
	import AddTimeslot from '$lib/components/home/AddTimeslot.svelte';
	import { fly } from 'svelte/transition';
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db/db';

	//initializeStores();

	let timeslots = liveQuery(() => db.timeslots.reverse().sortBy('date'));
</script>

<div class="relative">
	<div
		class="container min-w-full flex justify-between p-4 lg:p-6 flex-col lg:flex-row lg:max-h-screen"
	>
		<div class="card p-4 flex-none self-center sm:w-3/4 lg:w-2/5 xl:w-1/3 lg:self-baseline">
			<AddTimeslot settings={$settingsStore} statistics={$statisticsStore} />
		</div>
		<div
			class="flex flex-col overflow-y-scroll h-[calc(100vh-9rem)] rounded self-center lg:self-auto sm:w-3/5 lg:w-3/5 justify-around lg:justify-between mt-5 lg:mt-0"
		>
			<div class="flex flex-col gap-y-5 min-h-0">
				{#if $timeslots}
					{#each $timeslots as tt (tt.uuid)}
						<div animate:flip={{ delay: 100, duration: 200, easing: sineInOut }}>
							<div
								class="card p-4 flex-none ml-auto mr-0 w-full lg:w-1/2"
								in:fly|local={{ x: -1000, duration: 200, delay: 200 }}
								out:fly|local={{ y: -100, duration: 100, delay: 50 }}
							>
								<TimeslotCard timeslot={tt} id={tt.uuid} />
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>
