import { describe, test, expect, afterEach, beforeEach, beforeAll } from 'vitest';
import AddTimeslot from "../../../src/lib/components/home/AddTimeslot.svelte";
import { fireEvent, render, screen, type RenderResult, cleanup } from '@testing-library/svelte';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { Settings } from '../../../src/lib/models/Settings';
import type { StatisticsStore } from '../../../src/lib/models/StatisticsStore';
import { formatDate, formatDateToTime } from '../../../src/lib/utils/HelperFunctions';
import type { queries } from '@testing-library/svelte';

let defaultSettings: Settings = { plannedWorkingTime: { hours: 7, minutes: 30 }, standardStartTime: { hours: 7, minutes: 30 }, useStartupTime: true, showAfterStartup: true };
let defaultStats: StatisticsStore = { availableOvertime: { hours: 0, minutes: 0 } };
let component: RenderResult<AddTimeslot, typeof queries>;
let user: UserEvent;

describe("AddTimeslot Component", () => {
    beforeAll(() => {
        user = userEvent.setup();
    });

    beforeEach(() => {
        component = render(AddTimeslot, { props: { settings: defaultSettings, statistics: defaultStats } });
        expect(component).toBeTruthy();
    });

    afterEach(cleanup);

    test("test functionality of AddTimeslot component", async () => {
        let now = new Date();
        let dateString: string = now.toISOString().split('T')[0];

        let datepicker = component.getByTestId("timeslot-datepicker");
        expect(datepicker).toBeTruthy();
        await user.click(datepicker);
        await user.clear(datepicker);
        await user.type(datepicker, dateString);
        expect((datepicker as HTMLInputElement).value).toBe(dateString);

        let endInput = component.getByTestId("end-time-input");
        expect(endInput).toBeTruthy();
        fireEvent.mouseDown(endInput);
        await fireEvent.change(endInput, { target: { value: formatDateToTime(now) } })
        expect((endInput as HTMLInputElement).value).toBe(formatDateToTime(now));

        let saveBtn = component.getByTestId("timeslot-save-btn");
        expect(saveBtn).toBeTruthy();
        await userEvent.click(saveBtn);
        // expect(saveBtn).toHaveBeenCalled();

        expect(defaultStats.availableOvertime).not.toBe({ hours: 0, minutes: 0 });
    });

})