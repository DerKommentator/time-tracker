import { describe, test, expect, afterEach, beforeEach, beforeAll } from 'vitest';
import { fireEvent, render, screen, type RenderResult, cleanup } from '@testing-library/svelte';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { formatDate, formatDateToTime } from '../../../src/lib/utils/HelperFunctions';
import type { queries } from '@testing-library/svelte';
import DisplayGrid from '../../../src/lib/components/statistics/DisplayGrid.svelte';
import type { Timeslot } from '../../../src/lib/models/Timeslot';

let component: RenderResult<DisplayGrid, typeof queries>;
let user: UserEvent;
const uuid: string = crypto.randomUUID();
const now = new Date();
const timeslots: Timeslot[] = [
    {
        uuid: uuid,
        begin: { hours: 7, minutes: 30 },
        end: { hours: 16, minutes: 0 },
        date: now,
        statistics: {
            // availableOvertime: { hours: 1, minutes: 0 },
            hoursWorked: { hours: 8, minutes: 30 },
            timeDiffPlannedToWorked: { hours: 1, minutes: 0 }
        }
    },
    {
        uuid: uuid,
        begin: { hours: 7, minutes: 30 },
        end: { hours: 14, minutes: 30 },
        date: now,
        statistics: {
            // availableOvertime: { hours: 0, minutes: 30 },
            hoursWorked: { hours: 7, minutes: 0 },
            timeDiffPlannedToWorked: { hours: 0, minutes: -30 }
        }
    },
    {
        uuid: uuid,
        begin: { hours: 7, minutes: 30 },
        end: { hours: 9, minutes: 30 },
        date: now,
        statistics: {
            // availableOvertime: { hours: -5, minutes: 0 },
            hoursWorked: { hours: 2, minutes: 0 },
            timeDiffPlannedToWorked: { hours: -5, minutes: -30 }
        }
    },
    {
        uuid: uuid,
        begin: { hours: 8, minutes: 15 },
        end: { hours: 16, minutes: 10 },
        date: now,
        statistics: {
            // availableOvertime: { hours: -4, minutes: -35 },
            hoursWorked: { hours: 7, minutes: 55 },
            timeDiffPlannedToWorked: { hours: 0, minutes: 25 }
        }
    },
]

describe("DisplayGrid Component", () => {
    beforeAll(() => {
        user = userEvent.setup();
    });

    beforeEach(() => {
        component = render(DisplayGrid, {
            props: {
                data: timeslots
            }
        });

        // Should render
        expect(component).toBeTruthy();
    });

    afterEach(cleanup);

    test("test if values are correct calculated", async () => {
        const startAvgCard = component.getByTestId("start-avg-card");
        expect(startAvgCard).toBeTruthy();
        const startAvg = startAvgCard.getElementsByTagName("p")[1];
        expect(startAvg.innerHTML).toBe("07:41");

        const endAvgCard = component.getByTestId("end-avg-card");
        expect(endAvgCard).toBeTruthy();
        const endAvg = endAvgCard.getElementsByTagName("p")[1];
        expect(endAvg.innerHTML).toBe("14:02");

        const startMedianCard = component.getByTestId("start-median-card");
        expect(startMedianCard).toBeTruthy();
        const startMedian = startMedianCard.getElementsByTagName("p")[1];
        expect(startMedian.innerHTML).toBe("07:30");

        const endMedianCard = component.getByTestId("end-median-card");
        expect(endMedianCard).toBeTruthy();
        const endMedian = endMedianCard.getElementsByTagName("p")[1];
        expect(endMedian.innerHTML).toBe("16:00");

        const avalOtCard = component.getByTestId("aval-ot-card");
        expect(avalOtCard).toBeTruthy();
        const avalOt = avalOtCard.getElementsByTagName("p")[1];
        expect(avalOt.innerHTML).toBe("-04:35");
    });

})