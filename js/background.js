const DEFAULT_MENU_ITEMS = [
    {[M_ID]: ROOT_ID, [M_TITLE]: "SchedulePicker"},
    {[M_ID]: TODAY_ID, [M_TITLE]: "Today", [M_PARENT_ID]: ROOT_ID},
    {[M_ID]: TEMPLATE_ID, [M_TITLE]: "Template", [M_PARENT_ID]: ROOT_ID},
    {[M_ID]: TOMORROW_ID, [M_TITLE]: "Tomorrow", [M_PARENT_ID]: ROOT_ID},
    {[M_ID]: SELECT_ID, [M_TITLE]: "Select", [M_PARENT_ID]: ROOT_ID},
    {[M_ID]: MYSELF_ID, [M_TITLE]: "自分の予定", [M_PARENT_ID]: TODAY_ID}
];

const addMenuItem = (item) => {
    chrome.contextMenus.create({
        [M_ID]           : item[M_ID],
        [M_TITLE]        : item[M_TITLE],
        [M_PARENT_ID]    : item[M_PARENT_ID],
        "type"           : "normal",
        "contexts"       : ["all"],
        "onclick": (info, tab) => chrome.tabs.sendMessage(tab.id, item)
    });
};

const addMenuItems = (items) => {
    items.map(item => addMenuItem(item))
};

// Myグループ一覧を取得し、親Menuにぶら下げる
const setupContextMenus = async () => {
    const myGroups = await getMyGroups();
    const groupMenuItems = myGroups.map(g => {
        return {[M_ID]: g.key, [M_TITLE]: g.name, [M_PARENT_ID]: TODAY_ID, "myGroup": g}
    });
    addMenuItems(groupMenuItems);
};

// 右クリックでデフォルト表示されるMenu一覧を作成
addMenuItems(DEFAULT_MENU_ITEMS);
setupContextMenus();
