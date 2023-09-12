import type { Timeslot } from "$lib/models/Timeslot";
import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Settings } from "$lib/models/Settings";

// -------------- Timeslot Store --------------

const storedTimeslots: Array<Timeslot> = JSON.parse(localStorage.getItem("trackedTime") || "[]");

export const timeslotStore = writable(storedTimeslots);

timeslotStore.subscribe((value) => localStorage.setItem("trackedTime", JSON.stringify(value)));

// -------------- Settings Store --------------

const storedSettings: Settings = JSON.parse(localStorage.getItem("settings") || "{}");

export const settingsStore = writable(storedSettings);

settingsStore.subscribe((value) => localStorage.setItem("settings", JSON.stringify(value)));