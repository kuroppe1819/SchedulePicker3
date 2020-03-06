import { EventInfo, MyGroupEvent, TemplateEvent } from 'src/types/event';

export interface GenerateEvents {
    constructScheduleTitle(specificDateStr: string | undefined): string;
    constructEvents(events: EventInfo[]): string;
    constructMyGroupEvents(events: MyGroupEvent[], specificDateStr?: string): string;
    constructTemplateEvents(templateText: string, templateEvent: TemplateEvent): string;
}
