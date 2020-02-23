import { ContextMenuDayId } from 'src/types/contextmenu';

export class RadioActionServiceImpl {
    public static setDayIdInStorage(dayId: ContextMenuDayId): void {
        chrome.storage.sync.set({ dayId: dayId });
    }

    public static showPopupWindow(): void {
        window.open('../calendar.html', 'extension_calendar', 'width=300, height=100, status=no');
    }
}
