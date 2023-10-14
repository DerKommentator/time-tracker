import { describe, test, expect, afterEach, beforeEach, beforeAll } from 'vitest';
import { fireEvent, render, screen, type RenderResult, cleanup } from '@testing-library/svelte';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { queries } from '@testing-library/svelte';
import TimeGridCard from '../../../src/lib/components/statistics/TimeGridCard.svelte';
import type { Time } from '../../../src/lib/models/Time';
import { formatTime, minutesToTime } from '../../../src/lib/utils/HelperFunctions';

let component: RenderResult<TimeGridCard, typeof queries>;
let user: UserEvent;

const dataTestId: string = 'test-id-card';
const headline: string = 'Test Headline';
const displayTextString: string = 'Test Display Text';
const displayTextTime: Time = { hours: 10, minutes: 0 };
const displayTextNumber: number = 300;

describe('TimeGridCard Component', () => {
	beforeAll(() => {
		user = userEvent.setup();
	});

	afterEach(cleanup);

	test('test TimeGridCard with string text', async () => {
		component = render(TimeGridCard, {
			props: {
				dataTestId: dataTestId,
				headline: headline,
				displayText: displayTextString
			}
		});
		expect(component).toBeTruthy();

		const testCard = component.getByTestId('test-id-card');
		expect(testCard).toBeTruthy();

		const headlineCard = testCard.querySelector("p[data-testid='headline']");
		const displayTextCard = testCard.querySelector("p[data-testid='displayText']");

		expect(headlineCard?.innerHTML).toBe(headline);
		expect(displayTextCard?.innerHTML).toBe(displayTextString);
	});

	test('test TimeGridCard with time text', async () => {
		component = render(TimeGridCard, {
			props: {
				dataTestId: dataTestId,
				headline: headline,
				displayText: displayTextTime
			}
		});
		expect(component).toBeTruthy();

		const testCard = component.getByTestId('test-id-card');
		expect(testCard).toBeTruthy();

		const headlineCard = testCard.querySelector("p[data-testid='headline']");
		const displayTextCard = testCard.querySelector("p[data-testid='displayText']");

		expect(headlineCard?.innerHTML).toBe(headline);
		expect(displayTextCard?.innerHTML).toBe(formatTime(displayTextTime));
	});

	test('test TimeGridCard with number text', async () => {
		component = render(TimeGridCard, {
			props: {
				dataTestId: dataTestId,
				headline: headline,
				displayText: displayTextNumber
			}
		});
		expect(component).toBeTruthy();

		const testCard = component.getByTestId('test-id-card');
		expect(testCard).toBeTruthy();

		const headlineCard = testCard.querySelector("p[data-testid='headline']");
		const displayTextCard = testCard.querySelector("p[data-testid='displayText']");

		expect(headlineCard?.innerHTML).toBe(headline);
		expect(displayTextCard?.innerHTML).toBe(formatTime(minutesToTime(displayTextNumber)));
	});
});
