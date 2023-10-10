import type { Timeslot } from "$lib/models/Timeslot";
import { writable, type Writable } from 'svelte/store';
import type { Settings } from "$lib/models/Settings";
import type { StatisticsStore } from "$lib/models/StatisticsStore";

// -------------- Timeslot Store --------------

// const storedTimeslots: Array<Timeslot> = JSON.parse(localStorage.getItem("trackedTime") || "[]");

// export const timeslotStore = writable(storedTimeslots);

// timeslotStore.subscribe((value) => localStorage.setItem("trackedTime", JSON.stringify(value)));

// -------------- Settings Store --------------

let defaultSettings: Settings = { plannedWorkingTime: { hours: 7, minutes: 30 }, standardStartTime: { hours: 7, minutes: 30 }, useStartupTime: true, showAfterStartup: true };

const storedSettings: Settings = JSON.parse(localStorage.getItem("settings") || JSON.stringify(defaultSettings));

export const settingsStore = writable(storedSettings);

settingsStore.subscribe((value) => localStorage.setItem("settings", JSON.stringify(value)));

// -------------- Statistics Store --------------

// let defaultStats: StatisticsStore = { availableOvertime: { hours: 0, minutes: 0 } };

// const storedStatistics: StatisticsStore = JSON.parse(localStorage.getItem("statistics") || JSON.stringify(defaultStats));

// export const statisticsStore = writable(storedStatistics);

// statisticsStore.subscribe((value) => localStorage.setItem("statistics", JSON.stringify(value)));