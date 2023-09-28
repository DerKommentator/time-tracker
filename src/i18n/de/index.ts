import type { BaseTranslation } from '../i18n-types'

const de = {
	// Shared
	SAVE_LABEL: "Speichern",
	DELETED_LABEL: "Gelöscht!",
	ERROR_LABEL: "Fehler:",

	// Layout
	HOME_LABEL: "Startseite",
	SETTINGS_LABEL: "Einstellungen",
	STATISTICS_LABEL: "Statistiken",
	UPDATE: {
		RESTART_LABEL: "Neustart",
		VERSION_LABEL: "Version: {version}",
		TOOLTIP_UPDATE_AVAILABLE: "Ein neues Update ist verfügbar. Wird heruntergeladen...",
		TOOLTIP_UPDATE_NOT_AVAILABLE: "Du bist auf dem neuesten Stand!",
		TOOLTIP_UPDATE_ERROR: "Ein Fehler ist aufgetreten! Update Infos konnten nicht gekaden werden!",
		TOOLTIP_UPDATE_DOWNLOADED: "Update heruntergeladen. Es wird nach dem Neustart installiert. Jetzt neustarten?",
	},

	// === Home / Dashboard Page ===
	//	-- AddTimeslot Component
	TIMESLOT: {
		ADD_HEADLINE: "Manuell Hinzufügen:",
		DATE_LABEL: "Datum:",
		ERROR_END_MISSING: "Das Arbeitsende fehlt!",
		ERROR_ALREADY_EXIST: "Für diesen Tag gibt es bereits einen Eintrag!",
		ERROR_END_BEFORE_START: "Das Arbeitsende darf nicht vor dem Arbeitsbeginn sein!",

		TOAST_ADDED_SUCCESSFULLY: "Der Eintrag für {date} wurde erfolgreich hinzugefügt!",
		TOAST_ADDED_FAILED: "Ein Fehler beim Speichern vom Eintrag {date} ist aufgetreten: {error}",
	},

	TIMEINPUT: {
		START_LABEL: "Arbeitsbeginn:",
		END_LABEL: "Arbeitsende:",

		// TimeInput Component
		SET_CURRENT_TIME_LABEL: "Aktuelle Zeit setzen",
	},


	// -- TimeslotCard Component
	TIMECARD: {
		ERROR_DELETED: "Ein Fehler beim Löschen des Eintrags ist aufgetreten!",
	},


	// === Statistics Page ===
	// -- DisplayGrid Component
	GRIDCARD: {
		START_AVG: "Arbeitsbeginn Durchschnitt:",
		END_AVG: "Arbeitsende Durchschnitt:",
		START_MEDIAN: "Arbeitsbeginn Median:",
		END_MEDIAN: "Arbeitsende Median:",
		AVAILABLE_OVERTIME: "Verfügbare Überstunden:",
	},

	// -- BarChart Component
	BARCHART: {
		LEGEND_LABEL_WORKED: "Arbeitszeit (in Stunden)",
		LEGEND_LABEL_AVAL_OVERTIME: "Verfügbare Überstunden (in Stunden)",
	},

	// === Settings Page ===
	TOAST_SAVED_SUCCESSFULLY: "Erfolgreich gesichert!",
	SETTINGS: {
		DAILY_START: "Täglicher Arbeitsbeginn:",
		PLANNED_TIME: "Geplante Arbeitszeit:",
		USE_STARTUP_TIME: "Die Zeit beim Programmstart als Arbeitsbeginn nutzen?",
		LANGUAGE_LABEL: "Sprache:",
		CHANGES_AFTER_RESTART: "Einige Änderungen werden erst nach einem Neustart übernommen!"
	}
} satisfies BaseTranslation

export default de
