import type { Time } from "./Time";

export type Timeslot = {
    uuid: string;
    begin: Time;
    end: Time;
    date: Date;
}