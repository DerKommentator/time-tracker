import type { Timeslot } from '$lib/models/Timeslot';
import Dexie, { type Table } from 'dexie';

export class MySubClassedDexie extends Dexie {
    timeslots!: Table<Timeslot>;

    constructor() {
        super('timeslotsDb');
        this.version(1).stores({
            timeslots: '++uuid, begin, end, date, statistics'
        });
    }
}

export const db = new MySubClassedDexie();