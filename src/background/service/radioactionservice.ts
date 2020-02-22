import { ContextMenuDateId } from 'src/types/contextmenu';

export class RadioActionServiceImpl {
    public static setDateIdInStorage(dateId: ContextMenuDateId): void {
        chrome.storage.sync.set({ dateId: dateId });
    }

    public static showPopupWindow(): void {
        window.open('../calendar.html', 'extension_calendar', 'width=300, height=100, status=no');
    }
}
