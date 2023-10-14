import type { Time } from './Time';

export type Settings = {
	standardStartTime: Time;
	plannedWorkingTime: Time;
	useStartupTime: boolean;
	showAfterStartup: boolean;
};
