const convertIntToDateFormat = function(num) {
	if(num < 10){
		return "0" + num;
	}
	return num;
};

const getSchedule = function(date) {
	str_month = convertIntToDateFormat(date.month()+1);
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
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDay());
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDay(), 23, 59, 59);
    const events = await garoon.schedule.getEventsByTarget(startDate, endDate, undefined, undefined, myGroup.belong_member);
    const users = await garoon.base.getUsersById(myGroup.belong_member);

    events.map(function (event) {
        const userIds = event.members.users.map(u => u.id);
        let participants = "";
        users.forEach(function (user) {
            if (userIds.includes(user.key)) {
                participants += ` ${user.reading.split(" ")[0]} `;
            }
        });
        if (participants !== "") {
            event.detail += ` (${participants})`;
        }
        return event;
    });
    return events;
}

async function getMyGroupSchedules() {
    const groupSchedules = [];
    const myGroups = await getMyGroups();
    myGroups.map(async g => {
        const events = await getMyGroupSchedule(g);
        events.map(event => {
            groupSchedules.push({ "mygroup": g.key, "events": events });
        });
    });
}