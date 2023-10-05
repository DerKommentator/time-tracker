<script lang="ts">
	import type { Time } from '$lib/models/Time';
	import { IconArrowBack } from '@tabler/icons-svelte';
	import { settingsStore, statisticsStore } from '../../stores/store';
	import {
		Toast,
		getToastStore,
		type ToastSettings,
		SlideToggle,
		type ModalSettings,
		getModalStore,
		Modal
	} from '@skeletonlabs/skeleton';
	import { formatTime } from '$lib/utils/HelperFunctions';
	import { locales } from '../../i18n/i18n-util';
	import { locale, setLocale } from '../../i18n/i18n-svelte';
	import type { Locales } from '../../i18n/i18n-types';
	import LL from '../../i18n/i18n-svelte';
	import { loadLocaleAsync } from '../../i18n/i18n-util.async';
	import { db } from '$lib/db/db';
	import { goto } from '$app/navigation';

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	let databaseName: 'timeslots' | 'testTableTimeslots' = 'timeslots';

	if ((window as any)?.APP_TESTING) {
		databaseName = 'testTableTimeslots';
	}

	const askToDeleteDataModal: ModalSettings = {
		type: 'confirm',
		title: $LL.SETTINGS.DELETE_MODAL_TITLE(),
		body: $LL.SETTINGS.DELETE_MODAL_BODY(),
		buttonTextConfirm: $LL.DELETE_LABEL(),
		buttonTextCancel: $LL.CANCEL_LABEL(),

		response: (r: boolean) => {
			if (r) deleteAllData();
		}
	};

	let startTime: string = formatTime($settingsStore.standardStartTime || { hours: 7, minutes: 30 });
	let plannedWorkingTime: string = formatTime(
		$settingsStore.plannedWorkingTime || { hours: 7, minutes: 30 }
	);

	let useStartupTime: boolean = $settingsStore.useStartupTime;
	let showAfterStartup: boolean = $settingsStore.showAfterStartup;
	let selectedLocale: Locales = $locale || 'de';

	const fullnameLocales = { de: 'German', en: 'English' };

	function deleteAllData() {
		const toastSettings: ToastSettings = {
			message: $LL.TOAST_DELETED_SUCCESSFULLY(),
			background: 'variant-filled-success'
		};

		// Clear localstorage
		localStorage.clear();

		// Reset Stores
		settingsStore.set({
			plannedWorkingTime: { hours: 7, minutes: 30 },
			standardStartTime: { hours: 7, minutes: 30 },
			useStartupTime: true,
			showAfterStartup: true
		});
		statisticsStore.set({ availableOvertime: { hours: 0, minutes: 0 } });

		// Reset Language
		setLocale('de');

		// Clear timeslot table
		db.table(databaseName)
			.clear()
			.then(() => {
				toastStore.trigger(toastSettings);
			})
			.catch((err) => {
				toastSettings.message = $LL.TOAST_DELETED_FAILED();
				toastSettings.background = 'variant-filled-error';

				toastStore.trigger(toastSettings);
			})
			.finally(() => {
				//location.reload();
				goto('/');
			});
	}

	async function saveSettings() {
		const startTimes = startTime.split(':');
		const plannedTimes = plannedWorkingTime.split(':');
		const start: Time = { hours: parseInt(startTimes[0]), minutes: parseInt(startTimes[1]) };
		const planned: Time = { hours: parseInt(plannedTimes[0]), minutes: parseInt(plannedTimes[1]) };

		$settingsStore.plannedWorkingTime = planned;
		if (!useStartupTime) {
			$settingsStore.standardStartTime = start;
		}
		$settingsStore.useStartupTime = useStartupTime;

		if ($locale !== selectedLocale) {
			await loadLocaleAsync(selectedLocale);
			setLocale(selectedLocale);
			localStorage.setItem('lang', selectedLocale);
			(window as any).ipcRenderer.send('change-Language', selectedLocale);
		}

		$settingsStore.showAfterStartup = showAfterStartup;

		const toastSettings: ToastSettings = {
			message: $LL.TOAST_SAVED_SUCCESSFULLY(),
			background: 'variant-filled-success'
		};
		toastStore.trigger(toastSettings);
	}
</script>

<Modal buttonPositive="variant-filled-error" />
<div>
	<a
		class="btn variant-filled-primary mx-10 mt-10 lg:ml-10 lg:mt-0 lg:absolute"
		href="/"
		aria-label="Home"
	>
		<IconArrowBack />
	</a>

	<div class="card p-4 mt-10 mx-5 lg:mx-auto lg:w-1/2">
		<header class="card-header text-xl text-center"><strong>{$LL.SETTINGS_LABEL()}</strong></header>
		<section class="m-8">
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
				<span class:text-surface-400={useStartupTime}
					><strong>{$LL.SETTINGS.DAILY_START()}</strong></span
				>
				<div class="flex gap-4 m-2 mb-8">
					<input
						class="input text-center text-lg"
						type="time"
						disabled={useStartupTime}
						bind:value={startTime}
						aria-label="Settings: Set daily start of work"
					/>
				</div>
			</div>
			<div class="flex flex-row justify-between items-center mb-8">
				<span><strong>{$LL.SETTINGS.SHOW_AFTER_STARTUP()}</strong></span>
				<SlideToggle
					name="slide"
					active="bg-primary-500"
					size="md"
					class="m-2"
					bind:checked={showAfterStartup}
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
			<hr />
			<div class="flex flex-row justify-between items-center my-8">
				<span><strong>{@html $LL.SETTINGS.DELETE_DATA_LABEL()}</strong></span>
				<button
					data-testid="settings-del-all-data-btn"
					class="btn variant-filled-error"
					on:click={() => modalStore.trigger(askToDeleteDataModal)}
					>{$LL.SETTINGS.DELETE_DATA_BTN()}</button
				>
			</div>
		</section>
		<hr />
		<footer class="card-footer flex flex-row justify-between items-center mt-8">
			<span class="text-surface-200 text-sm w-2/3">{$LL.SETTINGS.CHANGES_AFTER_RESTART()}</span>
			<button class="btn variant-filled-primary" on:click={() => saveSettings()}
				>{$LL.SAVE_LABEL()}</button
			>
		</footer>
	</div>
</div>
