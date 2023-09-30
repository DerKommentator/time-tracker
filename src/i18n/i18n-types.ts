import type { BaseTranslation as BaseTranslationType, LocalizedString, RequiredParams } from 'typesafe-i18n'

//export type BaseTranslation = BaseTranslationType
export type BaseTranslation = RootTranslation;
export type BaseLocale = 'de'

export type Locales =
	| 'de'
	| 'en'

export type Translation = RootTranslation

export type Translations = RootTranslation

type RootTranslation = {
	// Shared
	YES_LABEL: string,
	NO_LABEL: string,
	CANCEL_LABEL: string,

	SAVE_LABEL: string,
	DELETED_LABEL: string,
	ERROR_LABEL: string,

	TOAST_SAVED_SUCCESSFULLY: string,
	TOAST_SAVED_FAILED: string,
	TOAST_DELETED_SUCCESSFULLY: string,
	TOAST_DELETED_FAILED: string,

	DELETE_LABEL: string,

	// Layout
	HOME_LABEL: string,
	SETTINGS_LABEL: string,
	STATISTICS_LABEL: string,
	UPDATE: {
		RESTART_LABEL: string,
		VERSION_LABEL: RequiredParams<'version'>,
		TOOLTIP_UPDATE_AVAILABLE: string,
		TOOLTIP_UPDATE_NOT_AVAILABLE: string,
		TOOLTIP_UPDATE_ERROR: string,
		TOOLTIP_UPDATE_DOWNLOADED: string,

	},

	// === Home / Dashboard Page ===
	//	-- AddTimeslot Component
	TIMESLOT: {
		ADD_HEADLINE: string,
		DATE_LABEL: string,
		ERROR_END_MISSING: string,
		ERROR_ALREADY_EXIST: string,
		ERROR_END_BEFORE_START: string,

		/**
		 * Timeslot for {date} successfully added!
		 * @param {string} date
		 */
		TOAST_ADDED_SUCCESSFULLY: RequiredParams<'date'>,

		/**
		 * Failed to add timeslot for {date}: {error}
		 * @param {string} date
		 * @param {string} error
		 */
		TOAST_ADDED_FAILED: RequiredParams<'date' | "error">,
	},

	TIMEINPUT: {
		START_LABEL: string,
		END_LABEL: string,

		// TimeInput Component
		SET_CURRENT_TIME_LABEL: string,
	}

	// -- TimeslotCard Component
	TIMECARD: {
		ERROR_DELETED: string,
	}


	// === Statistics Page ===
	// -- DisplayGrid Component
	GRIDCARD: {
		START_AVG: string,
		END_AVG: string,
		START_MEDIAN: string,
		END_MEDIAN: string,
		AVAILABLE_OVERTIME: string,
	}

	// -- BarChart Component
	BARCHART: {
		LEGEND_LABEL_WORKED: string,
		LEGEND_LABEL_AVAL_OVERTIME: string,
	}


	// === Settings Page ===
	SETTINGS: {
		DAILY_START: string,
		PLANNED_TIME: string,
		USE_STARTUP_TIME: string,
		SHOW_AFTER_STARTUP: string,
		LANGUAGE_LABEL: string,
		CHANGES_AFTER_RESTART: string,
		DELETE_DATA_LABEL: string,
		DELETE_DATA_BTN: string,
		DELETE_MODAL_TITLE: string,
		DELETE_MODAL_BODY: string,
	}
}

export type TranslationFunctions = {
	// Shared
	YES_LABEL: () => LocalizedString,
	NO_LABEL: () => LocalizedString,
	CANCEL_LABEL: () => LocalizedString,

	SAVE_LABEL: () => LocalizedString,
	DELETED_LABEL: () => LocalizedString,
	ERROR_LABEL: () => LocalizedString,

	TOAST_SAVED_SUCCESSFULLY: () => LocalizedString,
	TOAST_SAVED_FAILED: () => LocalizedString,
	TOAST_DELETED_SUCCESSFULLY: () => LocalizedString,
	TOAST_DELETED_FAILED: () => LocalizedString,

	DELETE_LABEL: () => LocalizedString,

	// Layout
	HOME_LABEL: () => LocalizedString,
	SETTINGS_LABEL: () => LocalizedString,
	STATISTICS_LABEL: () => LocalizedString,
	UPDATE: {
		RESTART_LABEL: () => LocalizedString,

		/**
		 * Version: {version}
		 * @param {string} version
		 */
		VERSION_LABEL: (arg: { version: string }) => LocalizedString,
		TOOLTIP_UPDATE_AVAILABLE: () => LocalizedString,
		TOOLTIP_UPDATE_NOT_AVAILABLE: () => LocalizedString,
		TOOLTIP_UPDATE_ERROR: () => LocalizedString,
		TOOLTIP_UPDATE_DOWNLOADED: () => LocalizedString,
	},


	// === Home / Dashboard Page ===
	//	-- AddTimeslot Component
	TIMESLOT: {
		ADD_HEADLINE: () => LocalizedString,
		DATE_LABEL: () => LocalizedString,
		ERROR_END_MISSING: () => LocalizedString,
		ERROR_ALREADY_EXIST: () => LocalizedString,
		ERROR_END_BEFORE_START: () => LocalizedString,

		/**
		 * Timeslot for {date} successfully added!
		 * @param {string} date
		 */
		TOAST_ADDED_SUCCESSFULLY: (arg: { date: string }) => LocalizedString,

		/**
		 * Failed to add timeslot for {date}: {error}
		 * @param {string} date
		 * @param {string} error
		 */
		TOAST_ADDED_FAILED: (arg: { date: string, error: string }) => LocalizedString,
	},

	TIMEINPUT: {
		START_LABEL: () => LocalizedString,
		END_LABEL: () => LocalizedString,

		// TimeInput Component
		SET_CURRENT_TIME_LABEL: () => LocalizedString,
	}

	// -- TimeslotCard Component
	TIMECARD: {
		ERROR_DELETED: () => LocalizedString,
	}


	// === Statistics Page ===
	// -- DisplayGrid Component
	GRIDCARD: {
		START_AVG: () => LocalizedString,
		END_AVG: () => LocalizedString,
		START_MEDIAN: () => LocalizedString,
		END_MEDIAN: () => LocalizedString,
		AVAILABLE_OVERTIME: () => LocalizedString,
	}

	// -- BarChart Component
	BARCHART: {
		LEGEND_LABEL_WORKED: () => LocalizedString,
		LEGEND_LABEL_AVAL_OVERTIME: () => LocalizedString,
	}


	// === Settings Page ===
	SETTINGS: {
		DAILY_START: () => LocalizedString,
		PLANNED_TIME: () => LocalizedString,
		USE_STARTUP_TIME: () => LocalizedString,
		LANGUAGE_LABEL: () => LocalizedString,
		SHOW_AFTER_STARTUP: () => LocalizedString,
		CHANGES_AFTER_RESTART: () => LocalizedString,
		DELETE_DATA_LABEL: () => LocalizedString,
		DELETE_DATA_BTN: () => LocalizedString,
		DELETE_MODAL_TITLE: () => LocalizedString,
		DELETE_MODAL_BODY: () => LocalizedString,
	}
}

export type Formatters = {}
