import { LitElement, html, property, customElement, TemplateResult, css } from 'lit-element';
import '../components/selectdate';
import '../components/savebutton';
import { StorageKeys } from 'src/types/storage';

@customElement('calendar-view')
export class CalendarView extends LitElement {
    @property({ type: String })
    date = '';

    constructor() {
        super();
        this.initProperties();
    }

    private initProperties = (): void => {
        chrome.storage.sync.get([StorageKeys.DATE], item => {
            if (item.date != null) {
                this.date = item.date;
            }
        });
    };

    onSelectedDate = (e): void => {
        this.date = e.currentTarget.value;
    };

    onClickedSave = (): void => {
        chrome.storage.sync.set({
            date: this.date,
        });
    };

    render(): TemplateResult {
        return html`
            <div class="calendar">
                <select-date .date=${this.date} .onSelectedDate=${this.onSelectedDate}></select-date>
                <save-button .onClickedSave=${this.onClickedSave}></save-button>
            </div>
        `;
    }

    static styles = css`
        .calendar {
            display: flex;
        }
        save-button {
            margin-left: 8px;
        }
    `;
}
