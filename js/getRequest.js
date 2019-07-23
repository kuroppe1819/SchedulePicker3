const convertIntToDateFormat = function (num) {
    if (num < 10) {
        return "0" + num;
    }
    return num;
};

const getSchedule = function (date) {
    str_month = convertIntToDateFormat(date.month() + 1);
    str_date = convertIntToDateFormat(date.date());

    day = date.year() + "-" + str_month + "-" + str_date;
    url = '/g/api/v1/schedule/events?rangeStart=' + day + 'T00:00:00%2b09:00&rangeEnd=' + day + 'T23:59:59%2b09:00';
    return $.ajax({
        method: 'GET',
        url: url,
        dataType: 'json',
        contentType: 'application/json'
    });
};

const garoon = new GaroonSoap(`https://bozuman.cybozu.com/g/`);

async function getMyGroups() {
    const myGroupVersions = await garoon.base.getMyGroupVersions([]);
    const myGroupIds = myGroupVersions.map(g => g.id);
    return garoon.base.getMyGroupsById(myGroupIds);
}

async function getMyGroupSchedule(myGroup) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const url = new URL('https://bozuman.cybozu.com/g/api/v1/schedule/events');
    url.searchParams.append('orderBy', 'start asc');
    url.searchParams.append('rangeStart', startDate.toISOString());
    url.searchParams.append('rangeEnd', endDate.toISOString());
    url.searchParams.append('targetType', 'user');

    let events = [];
    for (let i = 0; i < myGroup.belong_member.length; i++) {
        url.searchParams.append('target', myGroup.belong_member[i]);
        const response = await fetch(url.toString(), {headers: {'X-Requested-With': 'XMLHttpRequest'}});
        const responseJson = await response.json();
        events = events.concat(responseJson.events);
    }

    events = events.reduce((uniqueEvents, currentEvent) => {
        const duplicatedEvent = uniqueEvents.find(event => {
            return event.id === currentEvent.id;
        });

        if (!duplicatedEvent) {
            uniqueEvents.push(currentEvent);
        }
        return uniqueEvents;
    }, []);

    const users = await garoon.base.getUsersById(myGroup.belong_member);
    events = events.map((event) => {
        event.participants = [];
        event.attendees.forEach(participant => {
           users.forEach(user => {
              if (participant.id === user.key) {
                  event.participants.push(participant.name.split(" ")[0]);
              }
           });
        });
        //TODO: スケジュールのタイトルに名前を入れない
        event.subject += ` (${event.participants.join('、')})`;
        return event;
    });
    return [{"events": events}];
}
