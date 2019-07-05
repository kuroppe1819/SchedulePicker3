// Saves options to chrome.storage
function save_options() {
    var secret_schedule = document.getElementById('secret_sche').checked;
    var selected_date = document.getElementById('selected_date').value;
    var form = document.getElementById('form').innerHTML;

    chrome.storage.sync.set({
        secret: secret_schedule,
        select: selected_date,
        form: form
    }, function () {
        var status = document.getElementById('status');
        status.textContent = 'Saved';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        secret: '',
        select: '',
        form: ''
    }, function (items) {
        document.getElementById('secret_sche').checked = items.secret;
        document.getElementById('selected_date').value = items.select;
        document.getElementById('form').innerHTML = items.form;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

const garoon = new GaroonSoap(`https://bozuman.cybozu.com/g/`);

async function getMyGroups() {
    const myGroupIds = await garoon.base.getMyGroupVersions([]);
    return garoon.base.getMyGroupsById(myGroupIds);
}

async function getMyGroupSchedule(myGroup) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDay());
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDay(), 23, 59, 59);
    const events = await garoon.schedule.getEventsByTarget(startDate, endDate, undefined, undefined, myGroup.belong_member);

    const users = await garoon.base.getUsersById(myGroup[0].belong_member);

    events.map(function (event) {
        const userIds = event.members.users.map(u => u.id)
        let participants = "";
        users.forEach(function (user) {
            if (userIds.includes(user.key)) {
                participants += ` ${user.reading.split(" ")[0]} `;
            }
        })
        if (participants !== "") {
            event.detail += ` (${participants})`;
        }
        return event;
    });
}

async function getMyGroupSchedules() {
    const hoge = await getMyGroups()
    hoge.events.map(g => getMyGroupSchedule(g))
}

window.onload = getMyGroupSchedules;