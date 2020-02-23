import { ContextMenuDayId } from 'src/types/contextmenu';

export class RadioActionServiceImpl {
    public static showPopupWindow(): void {
        window.open('../calendar.html', 'extension_calendar', 'width=300, height=100, status=no');
    }
}
