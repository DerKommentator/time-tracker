<script lang="ts">
	import LL from '../../../i18n/i18n-svelte';
	import { db } from '$lib/db/db';
	import 'dexie-export-import';
	import download from 'downloadjs';
	import { Parser } from '@json2csv/plainjs';

	export let selectedFileType: string;

	const exportKeys: string[] = ['begin', 'end', 'breaktimePeriod'];

	async function exportData(filetype: string) {
		// const blob = await db.export({
		// 	prettyJson: true,
		// 	filter: (table, value, key) => table === 'timeslots'
		// });
		const blob = await db.export({
			prettyJson: true,
			filter: (table, value, key) => table === 'tableslots'
		});

		switch (filetype) {
			case 'csv':
				try {
					const parser = new Parser({});
					const csv = parser.parse(JSON.parse(await blob.text()));
					// console.log(csv);
					download(csv, 'timetracker-export.csv', 'text/csv');
				} catch (err) {
					console.error(err);
				}
				break;
			case 'json':
				download(blob, 'timetracker-export.json', 'application/json');
				break;
			// case 'xlsx':
			// 	download(blob, 'timetracker-export.json', 'application/json');
			// 	break;
			default:
				download(blob, 'timetracker-export.json', 'application/json');
				break;
		}
	}
</script>

<div>
	<button
		data-testid="export-data-btn"
		class="btn variant-filled-primary"
		on:click={() => exportData(selectedFileType)}>{$LL.EXPORT.EXPORT_BUTTON_LABEL()}</button
	>
</div>
