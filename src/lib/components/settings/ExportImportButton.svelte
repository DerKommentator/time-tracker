<script lang="ts">
	import LL from '../../../i18n/i18n-svelte';
	import { db } from '$lib/db/db';
	import 'dexie-export-import';
	import download from 'downloadjs';
	import { Parser } from '@json2csv/plainjs';
	import type { Collection } from 'dexie';
	import { calcTime, formatTime } from '$lib/utils/HelperFunctions';
	import {
		FileButton,
		getToastStore,
		initializeStores,
		type ToastSettings
	} from '@skeletonlabs/skeleton';
	import type { Timeslot } from '$lib/models/Timeslot';
	import type { Time } from '$lib/models/Time';

	export let isTestingMode: boolean = false;
	if ((window as any)?.APP_TESTING || isTestingMode) {
		// Has to be initilized in every component for component testing
		initializeStores();
	}

	const toastStore = getToastStore();
	let toastSettings: ToastSettings = {
		message: $LL.TOAST_FILETYPE_NOT_SUPPORTED(),
		background: 'variant-filled-error'
	};

	// export let selectedFileType: string;
	// const exportKeys: string[] = ['begin', 'end', 'breaktimePeriod'];
	type ExportData = {
		begin: string;
		breaktimePeriod: string;
		end: string;
		date: string;
		overtime: string;
	};

	// const possibleFiletypes: string[] = ['csv', 'json', 'db-backup'];
	let selectedFileType: string = 'csv';
	let files: FileList;
	const allowedFiletypes: string[] = ['csv', 'json', 'dbb'];
	const fullnameFileTypes: Record<string, string> = {
		csv: 'CSV',
		xlsx: 'Excel (XLSX)',
		json: 'JSON',
		dbb: 'Database Backup'
	};

	let lastOvertime: Time = { hours: 0, minutes: 0 };

	async function exportData(filetype: string) {
		var coll = db.timeslots.orderBy('date');

		map(coll, (doc: Timeslot) => {
			lastOvertime = calcTime(lastOvertime, doc.statistics.timeDiffPlannedToWorked, true);

			return {
				begin: formatTime(doc.begin),
				breaktimePeriod: formatTime(doc.breaktimePeriod),
				end: formatTime(doc.end),
				date: doc.date.toLocaleDateString(),
				overtime: formatTime(lastOvertime),
				egz: doc.isFlexitimeDay
			};
		})
			.then(async (result) => {
				switch (filetype) {
					case 'csv':
						try {
							const parser = new Parser({});
							const csv = parser.parse(result);
							// console.log(csv);
							download(csv, 'timetracker-export.csv', 'text/csv');
						} catch (err) {
							toastSettings = {
								message: $LL.EXPORT.TOAST_FAILED_EXPORT(),
								background: 'variant-filled-error'
							};
							toastStore.trigger(toastSettings);
							console.error(err);
						}
						break;
					case 'json':
						const json = JSON.stringify({ data: result }, null, 2);
						download(json, 'timetracker-export.json', 'application/json');
						break;
					case 'db-backup':
						const blob = await db.export({
							prettyJson: true,
							filter: (table, value, key) => table === 'timeslots'
						});

						download(blob, 'timetracker-db-export.dbb', 'application/json');
						break;
					// case 'xlsx':
					// 	download(blob, 'timetracker-export.json', 'application/json');
					// 	break;
				}
			})
			.catch((err) => {
				toastSettings = {
					message: $LL.EXPORT.TOAST_FAILED_DATA_EXTRACTION(),
					background: 'variant-filled-error'
				};
				toastStore.trigger(toastSettings);
				console.error(err.stack || err);
				return;
			});
	}

	// async function map(coll: Collection, mapperFn: any) {
	// 	var result: object[] = [];
	// 	await coll.each((row) => result.push(mapperFn(row)));
	// 	return result;
	// }

	async function map(coll: Collection, mapperFn: (doc: Timeslot) => ExportData) {
		var result: ExportData[] = [];
		await coll.each((row: Timeslot) => result.push(mapperFn(row)));
		return result;
	}

	function onChangeHandler(e: Event): void {
		if (files.length > 0) {
			importData(files);
		}
	}

	async function importData(files: FileList) {
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const fileExt = file.name.split('.').pop() || '';

			if (allowedFiletypes.includes(fileExt)) {
				try {
					await db.import(file);

					toastSettings = {
						message: $LL.EXPORT.TOAST_SUCCESS_IMPORT(),
						background: 'variant-filled-success'
					};
					toastStore.trigger(toastSettings);
				} catch (error) {
					console.log(error);
					toastSettings = {
						message: $LL.TOAST_NOT_DEXIE_EXPORT(),
						background: 'variant-filled-error'
					};
					toastStore.trigger(toastSettings);
				}
			} else {
				toastStore.trigger(toastSettings);
			}
		}
	}
</script>

<div class="flex flex-row m-2 gap-x-4">
	<div class="flex flex-row gap-x-4">
		<div class="flex flex-col -mt-7">
			<span class="text-center mb-2 text-sm">{$LL.EXPORT.FILETYPE_LABEL()}</span>
			<select
				class="select w-fit"
				data-testid="export-filetype-select"
				bind:value={selectedFileType}
			>
				{#each allowedFiletypes as ft}
					<option value={ft}>{fullnameFileTypes[ft]}</option>
				{/each}
			</select>
		</div>
		<button
			data-testid="export-data-btn"
			class="btn variant-filled-primary"
			on:click={() => exportData(selectedFileType)}>{$LL.EXPORT.EXPORT_BUTTON_LABEL()}</button
		>
	</div>

	<span class="divider-vertical" />

	<FileButton
		data-testid="import-data-btn"
		button="btn variant-filled-primary"
		name="files"
		bind:files
		on:change={onChangeHandler}>{$LL.EXPORT.IMPORT_BUTTON_LABEL()}</FileButton
	>
</div>
