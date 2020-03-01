export class RadioActionServiceImpl {
    public static showCalendarWindow(): void {
        // window.open('../calendar.html', 'extension_calendar', 'width=300, height=100, status=no');
        window.open(
            '../calendar.html',
            'calendar',
            'width=283, height=285, chrome, centerscreen, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, copyhistory=no'
        );
    }
}
