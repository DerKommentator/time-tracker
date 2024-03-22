import type { Timeslot } from '$lib/models/Timeslot';
import Dexie, { type Table } from 'dexie';

export class MySubClassedDexie extends Dexie {
	timeslots!: Table<Timeslot>;
	testTableTimeslots!: Table<Timeslot>;

	constructor() {
		super('timeslotsDb');
		this.version(3).stores({
			timeslots: '++uuid, begin, breaktimePeriod, end, date, statistics',
			testTableTimeslots: '++uuid, begin, breaktimePeriod, end, date, statistics'
		});
		this.version(4).stores({
			timeslots: '++uuid, begin, breaktimePeriod, end, date, statistics, isFlexitimeDay',
			testTableTimeslots: '++uuid, begin, breaktimePeriod, end, date, statistics, isFlexitimeDay'
		}).upgrade(tx => {
			return tx.table("timeslots").toCollection().modify(timeslot => {
				timeslot.isFlexitimeDay = 0;
			});
		});
	}
}

export const db = new MySubClassedDexie();
