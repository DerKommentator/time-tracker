import { describe, test, expect, afterEach, beforeEach, beforeAll, afterAll } from 'vitest';
import { fireEvent, render, screen, type RenderResult, cleanup } from '@testing-library/svelte';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { formatDate, formatDateToTime } from '../../../src/lib/utils/HelperFunctions';
import type { queries } from '@testing-library/svelte';
import BarChart from '../../../src/lib/components/statistics/BarChart.svelte';

let component: RenderResult<BarChart, typeof queries>;
let user: UserEvent;

const now = new Date();

let data: { date: string; worked: number; avalOt: number; }[] = [
    {
        date: formatDate(now),
        worked: 8.5,
        avalOt: 1,
    },
    {
        date: formatDate(addDays(now, 1)),
        worked: 7,
        avalOt: 0.5,
    },
    {
        date: formatDate(addDays(now, 2)),
        worked: 2,
        avalOt: -5,
    },
    {
        date: formatDate(addDays(now, 3)),
        worked: 7.92,
        avalOt: -4.58,
    }
];

function addDays(date: Date, days: number): Date {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

describe("BarChart Component", () => {
    beforeAll(() => {
        user = userEvent.setup();
    });

    beforeEach(() => {
        // const createElement = document.createElement.bind(document);
        // document.createElement = (tagName: any) => {
        //     if (tagName === 'canvas') {
        //         return {
        //             getContext: () => ({}),
        //             measureText: () => ({})
        //         };
        //     }
        //     return createElement(tagName);
        // };

        component = render(BarChart, {
            props: {
                data: data
            }
        });

        // Should render
        expect(component).toBeTruthy();
    });

    afterEach(cleanup);

    test("test functionality of BarChart component", async () => {
        const barChartCanvas = component.getByTestId("barchart-canvas");
        expect(barChartCanvas).toBeTruthy();
        // expect(barChartCanvas.innerHTML).toBe("KEK");
    });
})