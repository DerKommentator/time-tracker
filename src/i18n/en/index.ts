import type { Translation } from '../i18n-types';

const en = {
	// Shared
	YES_LABEL: 'YES',
	NO_LABEL: 'NO',
	CANCEL_LABEL: 'Cancel',

	SAVE_LABEL: 'Save',
	DELETED_LABEL: 'Deleted!',
	ERROR_LABEL: 'Error:',

	HOURS_LABEL: 'hours',
	MINUTES_LABEL: 'minutes',
	SHORT_HOURS_LABEL: 'h',
	SHORT_MINUTES_LABEL: 'min',

	DELETE_LABEL: 'DELETE',

	TOAST_SAVED_SUCCESSFULLY: 'Successfully saved!',
	TOAST_SAVED_FAILED: 'Save failed!',
	TOAST_DELETED_SUCCESSFULLY: 'Successfully deleted!',
	TOAST_DELETED_FAILED: 'Delete failed!',
	TOAST_FILETYPE_NOT_SUPPORTED: 'File type is not supported!',
	TOAST_NOT_DEXIE_EXPORT: "Given file is not a dexie export (db-backup)!",

	// Layout
	HOME_LABEL: 'Home',
	SETTINGS_LABEL: 'Settings',
	STATISTICS_LABEL: 'Statistics',
	UPDATE: {
		RESTART_LABEL: 'Restart',
		VERSION_LABEL: 'Version: {version}',
		TOOLTIP_UPDATE_AVAILABLE: 'A new update is available. Downloading now...',
		TOOLTIP_UPDATE_NOT_AVAILABLE: 'You are up to date!',
		TOOLTIP_UPDATE_ERROR: 'Error! Could not load update info!',
		TOOLTIP_UPDATE_DOWNLOADED: 'Update Downloaded. It will be installed on restart. Restart now?'
	},

	// === Home / Dashboard Page ===
	//	-- AddTimeslot Component
	TIMESLOT: {
		ADD_HEADLINE: 'Add manually:',
		DATE_LABEL: 'Date:',
		FLEXITIME_DAY_LABEL: 'EGZ:',
		ERROR_END_MISSING: 'The end of work is missing!',
		ERROR_ALREADY_EXIST: 'A timeslot for this date already exist!',
		ERROR_END_BEFORE_START: 'The start of work must be before the end of work!',
		ERROR_BREAKTIME_TO_LONG: 'The break cannot be longer than the working time!',

		TOAST_ADDED_SUCCESSFULLY: 'Timeslot for {date} successfully added!',
		TOAST_ADDED_FAILED: 'Failed to add timeslot for {date}: {error}'
	},

	TIMEINPUT: {
		START_LABEL: 'Start of Work:',
		BREAKTIME_LABEL: 'Breaktime:',
		BREAKTIME_PERIOD_LABEL: 'Period of your Breaktime:',
		END_LABEL: 'End of Work:',
		BREAKTIME_START: 'Breaktime Start',
		BREAKTIME_END: 'Breaktime End',

		// TimeInput Component
		SET_CURRENT_TIME_LABEL: 'Set current time'
	},

	// -- TimeslotCard Component
	TIMECARD: {
		ERROR_DELETED: 'Failed to delete the timeslot!'
	},

	// === Statistics Page ===
	STATISTICS: {
		// -- DisplayGrid Component
		GRIDCARD: {
			START_AVG: 'Average - Start of Work:',
			BREAKTIME_AVG: 'Average - Breaktime:',
			END_AVG: 'Average - End of Work:',
			START_MEDIAN: 'Median - Start of Work:',
			BREAKTIME_MEDIAN: 'Median - Breaktime:',
			END_MEDIAN: 'Median - End of Work:',
			AVAILABLE_OVERTIME: 'Available Overtime:'
		},

		// -- BarChart Component
		BARCHART: {
			LEGEND_LABEL_WORKED: 'Working Hours (in Hours)',
			LEGEND_LABEL_AVAL_OVERTIME: 'Available Overtime (in Hours)',
			LEGEND_LABEL_BREAKTIME: 'Breaktime (in Hours)',
			SHOW_ITEMS_LABEL: 'Items to render:',
			SHOW_FLEXITIME_DAYS: 'Show EGZ Days'
		},
	},

	// === Settings Page ===
	SETTINGS: {
		DAILY_START: 'Daily start of work:',
		PLANNED_TIME: 'Planned working hours:',
		USE_STARTUP_TIME: 'Use the time at program start as work start?',
		STANDARD_BREAKTIME: 'Regular breaktime:',
		LANGUAGE_LABEL: 'Language:',
		START_AFTER_BOOT: 'The program opens automatically after PC login?',
		SHOW_AFTER_STARTUP: 'Display the program window maximized after PC login?',
		CHANGES_AFTER_RESTART: 'Some changes are applied only after the restart!',
		DELETE_DATA_LABEL: "Delete <span class='text-error-500'>ALL</span> data completly?",
		DELETE_DATA_BTN: 'DELETE ALL',
		DELETE_MODAL_TITLE: 'Delete Everything?',
		DELETE_MODAL_BODY:
			"Are you sure you want to delete <span class='text-error-500 font-bold'>ALL</span> your data?",

		// Export Button Component
		EXPORT_LABEL: 'Export all time record:',
		EXPORT_IMPORT_DATA_LABEL: 'Export / Import (time records):',

		EXPORT_IMPORT_SETTINGS_LABEL: 'Export / Import (settings):',
	},

	// -- Export Component
	EXPORT: {
		EXPORT_BUTTON_LABEL: 'Export',
		IMPORT_BUTTON_LABEL: 'Import',
		MODAL_HEADER: 'Select the file type for the exported data!',
		MODAL_BODY: 'Possible file types:',
		FILETYPE_LABEL: 'File type:',
		TOAST_FAILED_EXPORT: 'The Export failed!',
		TOAST_SUCCESS_IMPORT: 'Import was successfully!',
		TOAST_FAILED_DATA_EXTRACTION: 'The data extraction failed!'
	}
} satisfies Translation;

export default en;
