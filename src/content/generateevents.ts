import { Event, MyGroupEvent, TemplateEventsInfo } from 'src/types/event';

export interface GenerateEvents {
    constructScheduleTitle(specificDateStr: string | undefined): string;
    constructEvents(events: Event[]): string;
    constructMyGroupEvents(events: MyGroupEvent[], specificDateStr?: string): string;
    constructTemplateEvents(templateText: string, templateEventsInfo: TemplateEventsInfo): string;
}
