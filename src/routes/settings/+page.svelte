<script lang="ts">
	import type { Time } from '$lib/models/Time';
	import { IconArrowBack } from '@tabler/icons-svelte';
	import { settingsStore } from '../../stores/store';
	import { Toast, getToastStore, type ToastSettings, SlideToggle } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import { formatTime } from '$lib/utils/HelperFunctions';
	import { locales } from '../../i18n/i18n-util';
	import { locale, setLocale } from '../../i18n/i18n-svelte';
	import type { Locales } from '../../i18n/i18n-types';
	import LL from '../../i18n/i18n-svelte';
	import { loadLocaleAsync } from '../../i18n/i18n-util.async';

	initializeStores();
	const toastStore = getToastStore();

	let startTime: string = formatTime($settingsStore.standardStartTime || { hours: 7, minutes: 30 });
	let plannedWorkingTime: string = formatTime(
		$settingsStore.plannedWorkingTime || { hours: 7, minutes: 30 }
	);

	let useStartupTime: boolean = $settingsStore.useStartupTime;
	let selectedLocale: Locales = $locale || 'de';

	const fullnameLocales = { de: 'German', en: 'English' };

	async function saveSettings() {
		const startTimes = startTime.split(':');
		const plannedTimes = startTime.split(':');
		const start: Time = { hours: parseInt(startTimes[0]), minutes: parseInt(startTimes[1]) };
		const planned: Time = { hours: parseInt(plannedTimes[0]), minutes: parseInt(plannedTimes[1]) };

		$settingsStore.standardStartTime = start;
		$settingsStore.plannedWorkingTime = planned;
		$settingsStore.useStartupTime = useStartupTime;

		if ($locale !== selectedLocale) {
			await loadLocaleAsync(selectedLocale);
			setLocale(selectedLocale);
		}

		const toastSettings: ToastSettings = {
			message: $LL.TOAST_SAVED_SUCCESSFULLY(),
			background: 'variant-filled-success'
		};
		toastStore.trigger(toastSettings);
	}
</script>

<div>
	<a class="btn variant-filled-primary m-10" href="/" aria-label="Home">
		<IconArrowBack />
	</a>
	<Toast position="tr" />

	<div class="card p-4 mx-4 lg:mx-auto lg:w-1/2">
		<header class="card-header text-xl text-center"><strong>{$LL.SETTINGS_LABEL()}</strong></header>
		<section class="m-8">
			<div>
				<span><strong>{$LL.SETTINGS.DAILY_START()}</strong></span>
				<div class="flex gap-4 m-2 mb-8">
					<input
						class="input text-center text-lg"
						type="time"
						bind:value={startTime}
						aria-label="Settings: Set daily start of work"
					/>
				</div>
			</div>
			<div>
				<span><strong>{$LL.SETTINGS.PLANNED_TIME()}</strong></span>
				<div class="flex gap-4 m-2 mb-8">
					<input
						class="input text-center text-lg"
						type="time"
						bind:value={plannedWorkingTime}
						aria-label="Settings: Set planned working time"
					/>
				</div>
			</div>
			<div class="flex flex-row justify-between items-center mb-8">
				<span><strong>{$LL.SETTINGS.USE_STARTUP_TIME()}</strong></span>
				<SlideToggle
					name="slide"
					active="bg-primary-500"
					size="md"
					class="m-2"
					bind:checked={useStartupTime}
				/>
			</div>
			<div>
				<span><strong>{$LL.SETTINGS.LANGUAGE_LABEL()}</strong></span>
				<select class="select m-2 mb-8" bind:value={selectedLocale}>
					{#each locales as locale}
						<option value={locale}>{fullnameLocales[locale]}</option>
					{/each}
				</select>
			</div>
		</section>
		<hr />
		<footer class="card-footer flex flex-row justify-between items-center mt-8">
			<span class="text-surface-200 text-sm">{$LL.SETTINGS.CHANGES_AFTER_RESTART()}</span>
			<button class="btn variant-filled-primary" on:click={() => saveSettings()}
				>{$LL.SAVE_LABEL()}</button
			>
		</footer>
	</div>
</div>
