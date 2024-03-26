<script lang="ts">
	import { flip } from 'svelte/animate';
	import { sineInOut, circOut } from 'svelte/easing';
	import { settingsStore } from '../stores/store';
	import TimeslotCard from '$lib/components/home/TimeslotCard.svelte';
	import AddTimeslot from '$lib/components/home/AddTimeslot.svelte';
	import { fly, slide } from 'svelte/transition';
	import { liveQuery, type Observable } from 'dexie';
	import { db } from '$lib/db/db';
	import { tryPersistWithoutPromtingUser } from '$lib/db/persistStorage';
	import { onDestroy, onMount } from 'svelte';
	import { IconSearch } from '@tabler/icons-svelte';
	import { formatStringToDate } from '$lib/utils/HelperFunctions';
	import type { Timeslot } from '$lib/models/Timeslot';
	import { IconTrash } from '@tabler/icons-svelte';

	let searchDate: string;
	let timeslots: Observable<Timeslot[]>;

	let databaseName: 'timeslots' | 'testTableTimeslots' = 'timeslots';

	if ((window as any)?.APP_TESTING) {
		databaseName = 'testTableTimeslots';
	}

	async function searchForDate() {
		if (searchDate) {
			const date = new Date(searchDate);
			timeslots = liveQuery(() => db[databaseName].where('date').equals(date).toArray());
		} else {
			timeslots = liveQuery(() => db[databaseName].reverse().sortBy('date'));
		}
	}

	onMount(async () => {
		await tryPersistWithoutPromtingUser();
		timeslots = liveQuery(() => db[databaseName].reverse().sortBy('date'));
	});
</script>

<div class="relative">
	<div
		class="container min-w-full flex justify-between p-4 lg:p-6 flex-col lg:flex-row lg:max-h-screen"
	>
		<div class="card p-4 flex-none self-center sm:w-3/4 lg:w-2/5 xl:w-1/3 lg:self-baseline">
			<AddTimeslot settings={$settingsStore} />
		</div>
		<div
			class="flex flex-col overflow-y-scroll pr-2 h-[calc(100vh-9rem)] rounded self-center lg:self-auto sm:w-3/5 lg:w-3/5 justify-around lg:justify-between mt-5 lg:mt-0"
		>
			<div class="flex flex-col gap-y-5 min-h-0">
				<div class="ml-auto mr-0 w-full lg:w-1/2">
					<!-- <span><strong>Search</strong></span> -->
					<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
						<div class="input-group-shim"><IconSearch /></div>
						<input type="date" bind:value={searchDate} on:input={() => searchForDate()} />
						<button
							class="variant-filled-surface"
							on:click={() => {
								searchDate = '';
								searchForDate();
							}}><IconTrash /></button
						>
					</div>
				</div>
				{#if $timeslots}
					{#each $timeslots as tt (tt.uuid)}
						<div animate:flip={{ delay: 50, duration: 200, easing: circOut }}>
							<div
								class="card p-2 flex-none ml-auto mr-0 w-full lg:w-1/2"
								in:fly|local={{ x: -1000, duration: 200, delay: 200 }}
								out:slide|local={{ axis: 'y', duration: 100, delay: 50 }}
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
