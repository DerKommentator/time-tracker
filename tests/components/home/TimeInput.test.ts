import { describe, test, expect, afterEach, beforeEach, beforeAll } from 'vitest';
import { fireEvent, render, screen, type RenderResult, cleanup } from '@testing-library/svelte';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { formatDate, formatDateToTime } from '../../../src/lib/utils/HelperFunctions';
import type { queries } from '@testing-library/svelte';
import TimeInput from '../../../src/lib/components/home/TimeInput.svelte';

let component: RenderResult<TimeInput, typeof queries>;
let user: UserEvent;
let inputError: boolean = false;
let timeString: string = "13:00";

describe("TimeInput Component", () => {
    beforeAll(() => {
        user = userEvent.setup();
    });

    beforeEach(() => {
        component = render(TimeInput, {
            props: {
                dataTestId: "test-time-input",
                inputError: inputError,
                label: "Test Input",
                time: timeString
            }
        });

        expect(component).toBeTruthy();
    });

    afterEach(cleanup);

    test("test functionality of TimeInput component", async () => {
        const now = new Date();

        const timeInput = component.getByTestId("test-time-input");
        expect(timeInput).toBeTruthy();
        fireEvent.mouseDown(timeInput);
        await fireEvent.change(timeInput, { target: { value: formatDateToTime(now) } })
        expect((timeInput as HTMLInputElement).value).toBe(formatDateToTime(now));

        const setCurrentTimeBtn = component.getByTestId("set-current-time-btn");
        expect(setCurrentTimeBtn).toBeTruthy();
        await userEvent.click(setCurrentTimeBtn);
        expect((timeInput as HTMLInputElement).value).toBe(formatDateToTime(new Date()));
    });

    // test("test error highlights", async () => {
    // });

})