import GaroonSoap from 'garoon-soap';
import * as base from 'garoon-soap/dist/type/base';
import { Event } from '../../types/event';
import { EventConverter } from './eventconverter';

export interface GaroonDataSource {
    getScheduleEvents(rangeStart: string, rangeEnd: string, targetType: string, target: string): Promise<Event[]>;
    getMyGroupVersions(myGroupItems: base.ItemVersionType[]): Promise<base.ItemVersionResultType[]>;
    getMyGroupsById(id: string[]): Promise<base.MyGroupType[]>;
    getCalendarEvents(): Promise<base.BaseGetCalendarEventType[]>;
}

export class GaroonDataSourceImpl implements GaroonDataSource {
    private baseUrl: string;
    private PATH = 'api/v1/';
    private soap: GaroonSoap;
    private TIMEOUT = 15000;

    private timeout = (ms, promise): Promise<any> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error(`Timeout: ${ms}ms`));
            }, ms);
            promise.then(resolve, reject);
        });
    };

    constructor(domain: string) {
        this.baseUrl = `https://${domain}/g/`;
        this.soap = new GaroonSoap(this.baseUrl);
    }

    public async getScheduleEvents(
        rangeStart: string,
        rangeEnd: string,
        targetType = '',
        target = ''
    ): Promise<Event[]> {
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

        const respStream = await this.timeout(
            this.TIMEOUT,
            fetch(url.toString(), {
                method: 'GET',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
            })
        ).catch(error => {
            throw error;
        });

        const respJson = await respStream.json();
        if (respStream.status !== 200) {
            throw new Error(
                `GaroonDataSource: errorCode: ${respJson.error.errorCode}, message: ${respJson.error.message}, cause: ${respJson.error.cause}`
            );
        }
        return respJson.events.map(event => {
            return EventConverter.convertToEvent(event, rangeStart, rangeEnd);
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
