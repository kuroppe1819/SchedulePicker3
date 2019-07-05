const M_ID           = "id";
const M_TITLE        = "title";
const M_PARENT_ID    = "parentId";

const ROOT_ID        = "root";
const TODAY_ID       = "today";

const DEFAULT_MENU_ITEMS = [
    {[M_ID]: ROOT_ID,    [M_TITLE]: "SchedulePicker"},
    {[M_ID]: TODAY_ID,   [M_TITLE]: "Today",    [M_PARENT_ID]: ROOT_ID},
    {[M_ID]: "form",     [M_TITLE]: "Template", [M_PARENT_ID]: ROOT_ID},
    {[M_ID]: "tomorrow", [M_TITLE]: "Tomorrow", [M_PARENT_ID]: ROOT_ID},
    {[M_ID]: "select",   [M_TITLE]: "Select",   [M_PARENT_ID]: ROOT_ID},
    {[M_ID]: "myself",   [M_TITLE]: "自分の予定", [M_PARENT_ID]: TODAY_ID}
];

const addMenuItem = function (item) {
    chrome.contextMenus.create({
        [M_ID]           : item[M_ID],
        [M_TITLE]        : item[M_TITLE],
        [M_PARENT_ID]    : item[M_PARENT_ID],
        "type"           : "normal",
        "contexts"       : ["all"],
        "onclick": (info, tab) => chrome.tabs.sendMessage(tab.id, item)
    });
};

const addMenuItems = function (items) {
    items.map(item => addMenuItem(item))
};

// 右クリックでデフォルト表示されるMenu一覧を作成
addMenuItems(DEFAULT_MENU_ITEMS);

// Myグループ一覧を取得し、親Menuにぶら下げる
const garoon = new GaroonSoap('https://bozuman.cybozu.com/g/');
garoon.base.getMyGroupVersions([]).then(events => {
        const ids = events.map(event => event.id);
        garoon.base.getMyGroupsById(ids).then(groups => {
            const groupMenuItems = groups.map(g => {
                return {[M_ID]: g.key, [M_TITLE]: g.name, [M_PARENT_ID]: TODAY_ID}
            });
            addMenuItems(groupMenuItems)
        });
    }
);
