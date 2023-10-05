import { describe, test, expect, afterEach, beforeEach, beforeAll } from 'vitest';
import { fireEvent, render, screen, type RenderResult, cleanup } from '@testing-library/svelte';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { formatDate, formatDateToTime } from '../../../src/lib/utils/HelperFunctions';
import type { queries } from '@testing-library/svelte';
import TimeslotCard from '../../../src/lib/components/home/TimeslotCard.svelte';
import type { Timeslot } from '../../../src/lib/models/Timeslot';

let component: RenderResult<TimeslotCard, typeof queries>;
let user: UserEvent;
const uuid: string = crypto.randomUUID();
const now = new Date();
const timeslot: Timeslot = {
    uuid: crypto.randomUUID(),
    begin: { hours: 7, minutes: 30 },
    end: { hours: 16, minutes: 0 },
    date: now,
    statistics: {
        availableOvertime: { hours: 1, minutes: 0 },
        hoursWorked: { hours: 8, minutes: 30 },
        timeDiffPlannedToWorked: { hours: 1, minutes: 0 }
    }
}

describe("TimeslotCard Component", () => {
    beforeAll(() => {
        user = userEvent.setup();
    });

    beforeEach(() => {
        component = render(TimeslotCard, {
            props: {
                id: uuid,
                timeslot: timeslot
            }
        });

        expect(component).toBeTruthy();
    });

    afterEach(cleanup);

    test("test functionality of TimeslotCard component", async () => {
        const dateLabel = component.getByTestId("timeslot-item-card-date");
        expect(dateLabel).toBeTruthy();
        expect(dateLabel.innerHTML).toBe(formatDate(now));

        const startInput = component.getByTestId("timeslot-item-card-start-time");
        expect(startInput).toBeTruthy();
        expect(startInput.hasAttribute('disabled')).toBeTruthy();
        expect((startInput as HTMLInputElement).value).toBe("07:30");


        const endInput = component.getByTestId("timeslot-item-card-end-time");
        expect(endInput).toBeTruthy();
        expect(endInput.hasAttribute('disabled')).toBeTruthy();
        expect((endInput as HTMLInputElement).value).toBe("16:00");
    });

    // test("test delete function", () => {

    // });

})