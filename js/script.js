const getTomorrowDate = (todayData) => {
    const today = moment(todayData);
    if (today.day() === 5) {
        return today.add(3, 'd');
    } else {
        return today.add(1, 'd');
    }
};

chrome.extension.onMessage.addListener(function (menuItem) {
    chrome.storage.sync.get(null, async function (items) {
        // 現在フォーカスが与えられている要素を取得する
        const target = document.activeElement;
        // フォーカスが外れているときactiveElementはnullかbodyを返す
        if (target === null || target.tagName === "BODY") return;

        const today = moment();
        switch (menuItem.id) {
            case MYSELF_ID: {
                const json        = await getSchedule(today);
                const schedule    = formatSchedule($(json));
                target.innerHTML += makehtml(schedule, items.secret, today.format('YYYY-MM-DD'));
                break;
            }
            case TOMORROW_ID: {
                const tomorrow    = getTomorrowDate(today);
                const json        = await getSchedule(tomorrow);
                const schedule    = formatSchedule($(json));
                target.innerHTML += makehtml(schedule, items.secret, tomorrow.format('YYYY-MM-DD'));
                break;
            }
            case TEMPLATE_ID: {
                const tomorrow            = getTomorrowDate(today);
                const todayJson           = await getSchedule(today);
                const tomorrowJson        = await getSchedule(tomorrow);
                const todaySchedule       = formatSchedule($(todayJson));
                const tomorrowSchedule    = formatSchedule($(tomorrowJson));
                target.innerHTML += makeForm(items.form, todaySchedule, tomorrowSchedule, items.secret, today, tomorrow);
                break;
            }
            case SELECT_ID: {
                const selectedDate    = moment(items.select); // オプション画面の日付情報を取得
                const json            = await getSchedule(selectedDate);
                const schedule        = formatSchedule($(json));
                target.innerHTML += makehtml(schedule, items.secret, items.select);
                break;
            }
            default:
                const schedule = await getMyGroupSchedule(menuItem.myGroup);
                const formattedSchedule = formatSchedule(schedule);
                target.innerHTML += makehtml(formattedSchedule, items.secret, today.format('YYYY-MM-DD'));
                break;
        }
    });
});
