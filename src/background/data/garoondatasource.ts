import GaroonSoap from 'garoon-soap';
import * as base from 'garoon-soap/dist/type/base';
import { EventInfo } from '../../types/event';
import { EventConverter } from './eventconverter';

export interface GaroonDataSource {
    getScheduleEvents(rangeStart: string, rangeEnd: string, targetType: string, target: string): Promise<EventInfo[]>;
    getMyGroupVersions(myGroupItems: base.ItemVersionType[]): Promise<base.ItemVersionResultType[]>;
    getMyGroupsById(id: string[]): Promise<base.MyGroupType[]>;
    getCalendarEvents(): Promise<base.BaseGetCalendarEventType[]>;
}

export class GaroonDataSourceImpl implements GaroonDataSource {
    private baseUrl: string;
    private PATH = 'api/v1/';
    private soap: GaroonSoap;

    constructor(domain: string) {
        this.baseUrl = `https://${domain}/g/`;
        this.soap = new GaroonSoap(this.baseUrl);
    }

    public async getScheduleEvents(
        rangeStart: string,
        rangeEnd: string,
        targetType = '',
        target = ''
    ): Promise<EventInfo[]> {
        const url = new URL(`${this.baseUrl}${this.PATH}schedule/events`);
        url.searchParams.append('orderBy', 'start asc');

        if (rangeStart !== null) {
            url.searchParams.append('rangeStart', rangeStart);
        }

        if (rangeEnd !== null) {
            url.searchParams.append('rangeEnd', rangeEnd);
        }

        if (targetType !== null && targetType !== '') {
            url.searchParams.append('targetType', targetType);
        }

        if (target !== null && target !== '') {
            url.searchParams.append('target', target);
        }

        const respStream = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
        });

        let respJson = { events: [] };
        try {
            respJson = await respStream.json();
        } catch (error) {
            throw new Error(`RuntimeErrorException: ${error.message}`);
        }
        return respJson.events.map(event => {
            return EventConverter.convertToEventInfo(event);
        });
    }

    public getMyGroupVersions(myGroupItems: base.ItemVersionType[]): Promise<base.ItemVersionResultType[]> {
        try {
            return this.soap.base.getMyGroupVersions(myGroupItems);
        } catch (error) {
            throw new Error(`GaroonDataSource: ${error.message}`);
        }
    }

    public getMyGroupsById(groupIds: string[]): Promise<base.MyGroupType[]> {
        try {
            return this.soap.base.getMyGroupsById(groupIds);
        } catch (error) {
            throw new Error(`GaroonDataSource: ${error.message}`);
        }
    }

    public getCalendarEvents(): Promise<base.BaseGetCalendarEventType[]> {
        try {
            return this.soap.base.getCalendarEvents();
        } catch (error) {
            throw new Error(`GaroonDataSource: ${error.message}`);
        }
    }
}
