import type { BaseTranslation } from '../i18n-types';

const de = {
	// Shared
	YES_LABEL: 'JA',
	NO_LABEL: 'NEIN',
	CANCEL_LABEL: 'Abbrechen',

	SAVE_LABEL: 'Speichern',
	DELETED_LABEL: 'Gelöscht!',
	ERROR_LABEL: 'Fehler:',

	HOURS_LABEL: 'Stunden',
	MINUTES_LABEL: 'Minuten',
	SHORT_HOURS_LABEL: 'h',
	SHORT_MINUTES_LABEL: 'min',

	DELETE_LABEL: 'LÖSCHEN',

	TOAST_SAVED_SUCCESSFULLY: 'Erfolgreich gespeichert!',
	TOAST_SAVED_FAILED: 'Speichern fehlgeschlagen!',
	TOAST_DELETED_SUCCESSFULLY: 'Erfolgreich gelöscht!',
	TOAST_DELETED_FAILED: 'Löschen fehlgeschlagen!',

	// Layout
	HOME_LABEL: 'Startseite',
	SETTINGS_LABEL: 'Einstellungen',
	STATISTICS_LABEL: 'Statistiken',
	UPDATE: {
		RESTART_LABEL: 'Neustart',
		VERSION_LABEL: 'Version: {version}',
		TOOLTIP_UPDATE_AVAILABLE: 'Ein neues Update ist verfügbar. Wird heruntergeladen...',
		TOOLTIP_UPDATE_NOT_AVAILABLE: 'Du bist auf dem neuesten Stand!',
		TOOLTIP_UPDATE_ERROR: 'Ein Fehler ist aufgetreten! Update Infos konnten nicht geladen werden!',
		TOOLTIP_UPDATE_DOWNLOADED:
			'Update heruntergeladen. Es wird nach dem Neustart installiert. Jetzt neustarten?'
	},

	// === Home / Dashboard Page ===
	//	-- AddTimeslot Component
	TIMESLOT: {
		ADD_HEADLINE: 'Manuell Hinzufügen:',
		DATE_LABEL: 'Datum:',
		ERROR_END_MISSING: 'Das Arbeitsende fehlt!',
		ERROR_ALREADY_EXIST: 'Für diesen Tag gibt es bereits einen Eintrag!',
		ERROR_END_BEFORE_START: 'Das Arbeitsende darf nicht vor dem Arbeitsbeginn sein!',

		TOAST_ADDED_SUCCESSFULLY: 'Der Eintrag für {date} wurde erfolgreich hinzugefügt!',
		TOAST_ADDED_FAILED: 'Ein Fehler beim Speichern vom Eintrag {date} ist aufgetreten: {error}'
	},

	TIMEINPUT: {
		START_LABEL: 'Arbeitsbeginn:',
		BREAKTIME_LABEL: 'Pausenzeit:',
		BREAKTIME_PERIOD_LABEL: 'Länge deiner Pause:',
		END_LABEL: 'Arbeitsende:',
		BREAKTIME_START: 'Pausenstart',
		BREAKTIME_END: 'Pausenende',

		// TimeInput Component
		SET_CURRENT_TIME_LABEL: 'Aktuelle Zeit setzen'
	},

	// -- TimeslotCard Component
	TIMECARD: {
		ERROR_DELETED: 'Ein Fehler beim Löschen des Eintrags ist aufgetreten!'
	},

	// === Statistics Page ===
	// -- DisplayGrid Component
	GRIDCARD: {
		START_AVG: 'Arbeitsbeginn Durchschnitt:',
		BREAKTIME_AVG: 'Pausenzeit Durchschnitt:',
		END_AVG: 'Arbeitsende Durchschnitt:',
		START_MEDIAN: 'Arbeitsbeginn Median:',
		BREAKTIME_MEDIAN: 'Pausenzeit Median:',
		END_MEDIAN: 'Arbeitsende Median:',
		AVAILABLE_OVERTIME: 'Verfügbare Überstunden:'
	},

	// -- BarChart Component
	BARCHART: {
		LEGEND_LABEL_WORKED: 'Arbeitszeit (in Stunden)',
		LEGEND_LABEL_AVAL_OVERTIME: 'Verfügbare Überstunden (in Stunden)',
		LEGEND_LABEL_BREAKTIME: 'Pausenzeit (in Stunden)'
	},

	// === Settings Page ===
	SETTINGS: {
		DAILY_START: 'Täglicher Arbeitsbeginn:',
		PLANNED_TIME: 'Geplante Arbeitszeit:',
		USE_STARTUP_TIME: 'Die Zeit beim Programmstart als Arbeitsbeginn nutzen?',
		STANDARD_BREAKTIME: 'Reguläre Pausenzeit:',
		LANGUAGE_LABEL: 'Sprache:',
		START_AFTER_BOOT: 'Das Programm startet automatisch nach der PC-Anmeldung?',
		SHOW_AFTER_STARTUP: 'Das Programmfenster nach der PC-Anmeldung maximiert anzeigen?',
		CHANGES_AFTER_RESTART: 'Einige Änderungen werden erst nach einem Neustart übernommen!',
		DELETE_DATA_LABEL: "Alle Daten für <span class='text-error-500'>IMMER</span> löschen?",
		DELETE_DATA_BTN: 'ALLES LÖSCHEN',
		DELETE_MODAL_TITLE: 'Alles Löschen?',
		DELETE_MODAL_BODY:
			"Bist du dir sicher, dass du <span class='text-error-500 font-bold'>ALLE</span> deine Daten löschen möchtest?",

		// Export Button Component
		EXPORT_LABEL: 'Alle Zeiterfassungen exportieren:',
		FILETYPE_LABEL: 'Dateityp:'
	},

	// -- Export Component
	EXPORT: {
		EXPORT_BUTTON_LABEL: 'Export',
		MODAL_HEADER: 'Wähle den passenden Dateityp für den Export aus!',
		MODAL_BODY: 'Mögliche Dateitypen:'
	}
} satisfies BaseTranslation;

export default de;
