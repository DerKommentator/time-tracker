<script lang="ts">
	import type { Time } from '$lib/models/Time';
	import { IconArrowBack } from '@tabler/icons-svelte';
	import { settingsStore } from '../../stores/store';
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
	import ExportButton from '$lib/components/settings/ExportButton.svelte';

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
	let startAfterBoot: boolean = $settingsStore.startAfterBoot;
	let standardBreaktime: string = formatTime(
		$settingsStore.standardBreaktime || { hours: 0, minutes: 40 }
	);

	const fullnameLocales = { de: 'Deutsch', en: 'English' };

	const possibleFileTypes: string[] = ['csv', 'json'];
	// const fullnameFileTypes = { csv: 'CSV', xlsx: 'Excel (XLSX)', json: 'JSON' };
	let selectedFileType: string = 'csv';

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
			showAfterStartup: true,
			startAfterBoot: true,
			standardBreaktime: { hours: 0, minutes: 40 }
		});
		// statisticsStore.set({ availableOvertime: { hours: 0, minutes: 0 } });

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

		const breaktimeSplitted = startTime.split(':');
		const breaktime: Time = {
			hours: parseInt(breaktimeSplitted[0]),
			minutes: parseInt(breaktimeSplitted[1])
		};
		$settingsStore.standardBreaktime = breaktime;

		if ($locale !== selectedLocale) {
			await loadLocaleAsync(selectedLocale);
			setLocale(selectedLocale);
			localStorage.setItem('lang', selectedLocale);
			(window as any).ipcRenderer.send('change-Language', selectedLocale);
		}

		$settingsStore.showAfterStartup = showAfterStartup;

		$settingsStore.startAfterBoot = startAfterBoot;
		(window as any).ipcRenderer.send('change-AutoStart', startAfterBoot);

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
		<header class="card-header text-xl text-center">
			<strong data-testid="settings-label">{$LL.SETTINGS_LABEL()}</strong>
		</header>
		<section class="m-8">
			<div class="flex flex-row justify-between items-center my-6">
				<span><strong>{$LL.SETTINGS.USE_STARTUP_TIME()}</strong></span>
				<SlideToggle name="slide" active="bg-primary-500" size="md" bind:checked={useStartupTime} />
			</div>
			<div class="flex flex-row justify-between items-center my-6">
				<span class="basis-3/4" class:text-surface-400={useStartupTime}
					><strong>{$LL.SETTINGS.DAILY_START()}</strong></span
				>
				<div class="w-full">
					<input
						class="input text-center text-lg"
						type="time"
						disabled={useStartupTime}
						bind:value={startTime}
						aria-label="Settings: Set daily start of work"
					/>
				</div>
			</div>

			<div class="flex flex-row justify-between items-center my-6">
				<span class="basis-3/4"><strong>{$LL.SETTINGS.PLANNED_TIME()}</strong></span>
				<div class="w-full">
					<input
						class="input text-center text-lg"
						type="time"
						bind:value={plannedWorkingTime}
						aria-label="Settings: Set planned working time"
					/>
				</div>
			</div>
			<div class="flex flex-row justify-between items-center my-6">
				<span class="basis-3/4"><strong>{$LL.SETTINGS.STANDARD_BREAKTIME()}</strong></span>
				<div class="w-full">
					<input
						class="input text-center text-lg"
						type="time"
						bind:value={standardBreaktime}
						aria-label="Settings: Set regular breaktime"
					/>
				</div>
			</div>

			<hr class="my-8" />

			<div class="flex flex-row justify-between items-center my-6">
				<span><strong>{$LL.SETTINGS.START_AFTER_BOOT()}</strong></span>
				<SlideToggle
					name="slide"
					active="bg-primary-500"
					size="md"
					class="m-2"
					bind:checked={startAfterBoot}
				/>
			</div>
			<div class="flex flex-row justify-between items-center my-6">
				<span><strong>{$LL.SETTINGS.SHOW_AFTER_STARTUP()}</strong></span>
				<SlideToggle
					name="slide"
					active="bg-primary-500"
					size="md"
					class="m-2"
					bind:checked={showAfterStartup}
				/>
			</div>
			<div class="flex flex-row justify-between items-center my-6">
				<span><strong>{$LL.SETTINGS.LANGUAGE_LABEL()}</strong></span>
				<select class="select m-2" data-testid="settings-lang-select" bind:value={selectedLocale}>
					{#each locales as locale}
						<option value={locale}>{fullnameLocales[locale]}</option>
					{/each}
				</select>
			</div>

			<hr class="my-8" />

			<div class="flex flex-row justify-between items-center mb-6 mt-12">
				<span class="break-words"><strong>{$LL.SETTINGS.EXPORT_LABEL()}</strong></span>
				<div class="flex flex-row m-2 gap-x-4">
					<div class="flex flex-col -mt-7">
						<span class="text-center mb-2 text-sm">{$LL.SETTINGS.FILETYPE_LABEL()}</span>
						<select
							class="select w-fit"
							data-testid="export-filetype-select"
							bind:value={selectedFileType}
						>
							{#each possibleFileTypes as ft}
								<option value={ft}>{ft}</option>
							{/each}
						</select>
					</div>
					<ExportButton {selectedFileType} />
				</div>
			</div>

			<hr class="my-8" />

			<div class="flex flex-row justify-between items-center my-6">
				<span><strong>{@html $LL.SETTINGS.DELETE_DATA_LABEL()}</strong></span>
				<button
					data-testid="settings-del-all-data-btn"
					class="btn variant-filled-error"
					on:click={() => modalStore.trigger(askToDeleteDataModal)}
					>{$LL.SETTINGS.DELETE_DATA_BTN()}</button
				>
			</div>
		</section>
		<hr class="my-8" />
		<footer class="card-footer flex flex-row justify-between items-center mt-6">
			<span class="text-surface-200 text-sm w-2/3">{$LL.SETTINGS.CHANGES_AFTER_RESTART()}</span>
			<button
				class="btn variant-filled-primary"
				data-testid="settings-save-btn"
				on:click={() => saveSettings()}>{$LL.SAVE_LABEL()}</button
			>
		</footer>
	</div>
</div>
