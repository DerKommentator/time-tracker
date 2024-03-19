import type { Time } from '$lib/models/Time';

export function timeToHours(time: Time): number {
	return parseFloat((time.hours + time.minutes / 60).toFixed(2));
}

export function timeToMinutes(time: Time): number {
	return time.hours * 60 + time.minutes;
}

export function minutesToTime(minutes: number): Time {
	let div = minutes / 60;
	let hours: number = Math.trunc(div);
	let remainder: string = (div % 1).toFixed(2);
	let min: number = parseFloat(remainder) * 60;
	return { hours: hours, minutes: Math.round(min) };
}

export function formatTime(time: Time): string {
	return String(time.hours).padStart(2, '0') + ':' + String(time.minutes).padStart(2, '0');
}

export function formatTimeWithLabels(time: Time, hourLabel: string, minLabel: string): string {
	return `${String(time.hours)} ${hourLabel} ${String(time.minutes)} ${minLabel}`;
}

export function formatDateToTime(date: Date): string {
	return new Date(date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date: Date): string {
	return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}


/**
 * Compare two dates
 *
 * @param {Date} date1
 * @param {Date} date2
 * @returns {number} If date1 is before date2: 1.
 *     If date1 and date2 are equal: 0.
 *     If date2 is before date1: -1.
 */
export function compareDates(date1: Date, date2: Date): number {
	date1 = new Date(Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate()));
	date2 = new Date(Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate()));

	if (date1.getTime() < date2.getTime()) {
		return 1;
	}
	else if (date1.getTime() == date2.getTime()) {
		return 0;
	}
	else {
		return -1;
	}

}

export function formatStringToDate(dateString: string) {
	let [d, m, y] = dateString.split(/\D/);
	return new Date(+y, +m - 1, +d, 1);
};

export function stringToTime(time: string): Time {
	const times = time.split(':');
	return { hours: parseInt(times[0]), minutes: parseInt(times[1]) };
}

export function calcTime(start: Time, end: Time, addition: boolean = false): Time {
	let startTimeInMin: number = start.hours * 60 + start.minutes;
	let endTimeInMin: number = end.hours * 60 + end.minutes;

	if (addition) {
		startTimeInMin *= -1;
	}
	let diff: number = endTimeInMin - startTimeInMin;
	let hours: number = Math.trunc(diff / 60);
	let remainder: number = (diff / 60) % 1;
	let minutes: number = remainder * 60;

	return { hours: hours, minutes: parseInt(minutes.toFixed(0)) };
}

export function formatOvertime(overtime: Time): string {
	if (overtime.hours < 0 || overtime.minutes < 0) {
		return `-${formatTime({
			hours: Math.abs(overtime.hours),
			minutes: Math.abs(overtime.minutes)
		})}`;
	} else {
		return formatTime(overtime);
	}
}
