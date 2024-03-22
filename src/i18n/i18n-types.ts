import type {
	BaseTranslation as BaseTranslationType,
	LocalizedString,
	RequiredParams
} from 'typesafe-i18n';

//export type BaseTranslation = BaseTranslationType
export type BaseTranslation = RootTranslation;
export type BaseLocale = 'de';

export type Locales = 'de' | 'en';

export type Translation = RootTranslation;

export type Translations = RootTranslation;

type RootTranslation = {
	// Shared
	YES_LABEL: string;
	NO_LABEL: string;
	CANCEL_LABEL: string;

	SAVE_LABEL: string;
	DELETED_LABEL: string;
	ERROR_LABEL: string;

	HOURS_LABEL: string;
	SHORT_HOURS_LABEL: string;
	MINUTES_LABEL: string;
	SHORT_MINUTES_LABEL: string;

	TOAST_SAVED_SUCCESSFULLY: string;
	TOAST_SAVED_FAILED: string;
	TOAST_DELETED_SUCCESSFULLY: string;
	TOAST_DELETED_FAILED: string;
	TOAST_FILETYPE_NOT_SUPPORTED: string;
	TOAST_NOT_DEXIE_EXPORT: string;

	DELETE_LABEL: string;

	// Layout
	HOME_LABEL: string;
	SETTINGS_LABEL: string;
	STATISTICS_LABEL: string;
	UPDATE: {
		RESTART_LABEL: string;
		VERSION_LABEL: RequiredParams<'version'>;
		TOOLTIP_UPDATE_AVAILABLE: string;
		TOOLTIP_UPDATE_NOT_AVAILABLE: string;
		TOOLTIP_UPDATE_ERROR: string;
		TOOLTIP_UPDATE_DOWNLOADED: string;
	};

	// === Home / Dashboard Page ===
	//	-- AddTimeslot Component
	TIMESLOT: {
		ADD_HEADLINE: string;
		DATE_LABEL: string;
		FLEXITIME_DAY_LABEL: string;
		ERROR_END_MISSING: string;
		ERROR_ALREADY_EXIST: string;
		ERROR_END_BEFORE_START: string;

		/**
		 * Timeslot for {date} successfully added!
		 * @param {string} date
		 */
		TOAST_ADDED_SUCCESSFULLY: RequiredParams<'date'>;

		/**
		 * Failed to add timeslot for {date}: {error}
		 * @param {string} date
		 * @param {string} error
		 */
		TOAST_ADDED_FAILED: RequiredParams<'date' | 'error'>;
	};

	TIMEINPUT: {
		START_LABEL: string;
		BREAKTIME_LABEL: string;
		BREAKTIME_PERIOD_LABEL: string;
		END_LABEL: string;
		BREAKTIME_START: string;
		BREAKTIME_END: string;
		// TimeInput Component
		SET_CURRENT_TIME_LABEL: string;
	};

	// -- TimeslotCard Component
	TIMECARD: {
		ERROR_DELETED: string;
	};

	// === Statistics Page ===
	STATISTICS: {
		// -- DisplayGrid Component
		GRIDCARD: {
			START_AVG: string;
			BREAKTIME_AVG: string;
			END_AVG: string;
			START_MEDIAN: string;
			BREAKTIME_MEDIAN: string;
			END_MEDIAN: string;
			AVAILABLE_OVERTIME: string;
		};

		// -- BarChart Component
		BARCHART: {
			LEGEND_LABEL_WORKED: string;
			LEGEND_LABEL_AVAL_OVERTIME: string;
			LEGEND_LABEL_BREAKTIME: string;
			SHOW_ITEMS_LABEL: string;
			SHOW_FLEXITIME_DAYS: string;
		};
	};

	// === Settings Page ===
	SETTINGS: {
		DAILY_START: string;
		PLANNED_TIME: string;
		USE_STARTUP_TIME: string;
		STANDARD_BREAKTIME: string;
		START_AFTER_BOOT: string;
		SHOW_AFTER_STARTUP: string;
		LANGUAGE_LABEL: string;
		CHANGES_AFTER_RESTART: string;
		DELETE_DATA_LABEL: string;
		DELETE_DATA_BTN: string;
		DELETE_MODAL_TITLE: string;
		DELETE_MODAL_BODY: string;

		// Export Button Component
		EXPORT_LABEL: string;
		EXPORT_IMPORT_DATA_LABEL: string;

		EXPORT_IMPORT_SETTINGS_LABEL: string;
	};

	// -- Export Component
	EXPORT: {
		EXPORT_BUTTON_LABEL: string;
		IMPORT_BUTTON_LABEL: string;
		MODAL_HEADER: string;
		MODAL_BODY: string;
		FILETYPE_LABEL: string;
		TOAST_FAILED_EXPORT: string;
		TOAST_SUCCESS_IMPORT: string;
		TOAST_FAILED_DATA_EXTRACTION: string;
	}
};

export type TranslationFunctions = {
	// Shared
	YES_LABEL: () => LocalizedString;
	NO_LABEL: () => LocalizedString;
	CANCEL_LABEL: () => LocalizedString;

	SAVE_LABEL: () => LocalizedString;
	DELETED_LABEL: () => LocalizedString;
	ERROR_LABEL: () => LocalizedString;

	HOURS_LABEL: () => LocalizedString;
	MINUTES_LABEL: () => LocalizedString;
	SHORT_HOURS_LABEL: () => LocalizedString;
	SHORT_MINUTES_LABEL: () => LocalizedString;

	TOAST_SAVED_SUCCESSFULLY: () => LocalizedString;
	TOAST_SAVED_FAILED: () => LocalizedString;
	TOAST_DELETED_SUCCESSFULLY: () => LocalizedString;
	TOAST_DELETED_FAILED: () => LocalizedString;
	TOAST_FILETYPE_NOT_SUPPORTED: () => LocalizedString;
	TOAST_NOT_DEXIE_EXPORT: () => LocalizedString;

	DELETE_LABEL: () => LocalizedString;

	// Layout
	HOME_LABEL: () => LocalizedString;
	SETTINGS_LABEL: () => LocalizedString;
	STATISTICS_LABEL: () => LocalizedString;
	UPDATE: {
		RESTART_LABEL: () => LocalizedString;

		/**
		 * Version: {version}
		 * @param {string} version
		 */
		VERSION_LABEL: (arg: { version: string }) => LocalizedString;
		TOOLTIP_UPDATE_AVAILABLE: () => LocalizedString;
		TOOLTIP_UPDATE_NOT_AVAILABLE: () => LocalizedString;
		TOOLTIP_UPDATE_ERROR: () => LocalizedString;
		TOOLTIP_UPDATE_DOWNLOADED: () => LocalizedString;
	};

	// === Home / Dashboard Page ===
	//	-- AddTimeslot Component
	TIMESLOT: {
		ADD_HEADLINE: () => LocalizedString;
		DATE_LABEL: () => LocalizedString;
		FLEXITIME_DAY_LABEL: () => LocalizedString;
		ERROR_END_MISSING: () => LocalizedString;
		ERROR_ALREADY_EXIST: () => LocalizedString;
		ERROR_END_BEFORE_START: () => LocalizedString;

		/**
		 * Timeslot for {date} successfully added!
		 * @param {string} date
		 */
		TOAST_ADDED_SUCCESSFULLY: (arg: { date: string }) => LocalizedString;

		/**
		 * Failed to add timeslot for {date}: {error}
		 * @param {string} date
		 * @param {string} error
		 */
		TOAST_ADDED_FAILED: (arg: { date: string; error: string }) => LocalizedString;
	};

	TIMEINPUT: {
		START_LABEL: () => LocalizedString;
		BREAKTIME_LABEL: () => LocalizedString;
		BREAKTIME_PERIOD_LABEL: () => LocalizedString;
		END_LABEL: () => LocalizedString;
		BREAKTIME_START: () => LocalizedString;
		BREAKTIME_END: () => LocalizedString;

		// TimeInput Component
		SET_CURRENT_TIME_LABEL: () => LocalizedString;
	};

	// -- TimeslotCard Component
	TIMECARD: {
		ERROR_DELETED: () => LocalizedString;
	};

	// === Statistics Page ===
	STATISTICS: {
		// -- DisplayGrid Component
		GRIDCARD: {
			START_AVG: () => LocalizedString;
			BREAKTIME_AVG: () => LocalizedString;
			END_AVG: () => LocalizedString;
			START_MEDIAN: () => LocalizedString;
			BREAKTIME_MEDIAN: () => LocalizedString;
			END_MEDIAN: () => LocalizedString;
			AVAILABLE_OVERTIME: () => LocalizedString;
		};

		// -- BarChart Component
		BARCHART: {
			LEGEND_LABEL_WORKED: () => LocalizedString;
			LEGEND_LABEL_AVAL_OVERTIME: () => LocalizedString;
			LEGEND_LABEL_BREAKTIME: () => LocalizedString;
			SHOW_ITEMS_LABEL: () => LocalizedString;
			SHOW_FLEXITIME_DAYS: () => LocalizedString;
		};
	};

	// === Settings Page ===
	SETTINGS: {
		DAILY_START: () => LocalizedString;
		PLANNED_TIME: () => LocalizedString;
		USE_STARTUP_TIME: () => LocalizedString;
		STANDARD_BREAKTIME: () => LocalizedString;
		LANGUAGE_LABEL: () => LocalizedString;
		START_AFTER_BOOT: () => LocalizedString;
		SHOW_AFTER_STARTUP: () => LocalizedString;
		CHANGES_AFTER_RESTART: () => LocalizedString;
		DELETE_DATA_LABEL: () => LocalizedString;
		DELETE_DATA_BTN: () => LocalizedString;
		DELETE_MODAL_TITLE: () => LocalizedString;
		DELETE_MODAL_BODY: () => LocalizedString;

		// Export Button Component
		EXPORT_LABEL: () => LocalizedString;
		EXPORT_IMPORT_DATA_LABEL: () => LocalizedString;

		EXPORT_IMPORT_SETTINGS_LABEL: () => LocalizedString;
	};

	// -- Export Component
	EXPORT: {
		EXPORT_BUTTON_LABEL: () => LocalizedString;
		IMPORT_BUTTON_LABEL: () => LocalizedString;
		MODAL_HEADER: () => LocalizedString;
		MODAL_BODY: () => LocalizedString;
		FILETYPE_LABEL: () => LocalizedString;
		TOAST_FAILED_EXPORT: () => LocalizedString;
		TOAST_SUCCESS_IMPORT: () => LocalizedString;
		TOAST_FAILED_DATA_EXTRACTION: () => LocalizedString;
	};
};

export type Formatters = {};
