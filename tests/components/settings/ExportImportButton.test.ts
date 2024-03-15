import { describe, test, expect, afterEach, beforeEach, beforeAll } from 'vitest';
import { fireEvent, render, screen, type RenderResult, cleanup } from '@testing-library/svelte';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { formatDate, formatDateToTime } from '../../../src/lib/utils/HelperFunctions';
import type { queries } from '@testing-library/svelte';
import ExportImportButton from '$lib/components/settings/ExportImportButton.svelte';

let component: RenderResult<ExportImportButton, typeof queries>;
let user: UserEvent;

describe('ExportImportButton Component', () => {
    beforeAll(() => {
        user = userEvent.setup();
    });

    beforeEach(() => {
        component = render(ExportImportButton, { props: { isTestingMode: true } });

        expect(component).toBeTruthy();
    });

    afterEach(cleanup);

    test('test export function', async () => {
        const filetypeSelect = component.getByTestId('export-filetype-select') as HTMLSelectElement;
        expect(filetypeSelect).toBeTruthy();
        filetypeSelect.value = "csv";
        expect(filetypeSelect.selectedOptions[0].value).equal("csv");

        // const exportButton = component.getByTestId('export-data-btn') as HTMLButtonElement;
        // await exportButton.click();
    });

    // test('test import function', async () => {
    //     const importButton = component.getByTestId('import-data-btn') as HTMLButtonElement;
    //     await importButton.click();
    // });
});
