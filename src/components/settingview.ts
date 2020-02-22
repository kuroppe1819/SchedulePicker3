import { LitElement, html, css, property, customElement, TemplateResult } from 'lit-element';
import './changeshowprivateevent';
import './changeshowalldayevent';
import './selectdate';
import './editabletemplate';
import './savebutton';
import { StorageKeys } from 'src/types/storage';

@customElement('setting-view')
export class SettingView extends LitElement {
    @property({ type: Boolean })
    isIncludePrivateEvent;

    @property({ type: Boolean })
    isIncludeAllDayEvent;

    @property({ type: String })
    templateText;
    constructor() {
        super();
        this.initProperties();
    }

    private initProperties = (): void => {
        chrome.storage.sync.get(
            [StorageKeys.IS_INCLUDE_PRIVATE_EVENT, StorageKeys.IS_INCLUDE_ALL_DAY_EVENT, StorageKeys.TEMPLATE_TEXT],
            item => {
                this.isIncludePrivateEvent = item.isIncludePrivateEvent;
                this.isIncludeAllDayEvent = item.isIncludeAllDayEvent;
                this.templateText = item.templateText;
            }
        );
    };

    onChangeShowPrivateEvent = (e): void => {
        this.isIncludePrivateEvent = e.currentTarget.checked;
    };

    onChangeShowAllDayEvent = (e): void => {
        this.isIncludeAllDayEvent = e.currentTarget.checked;
    };

    onBlurTemplate = (e): void => {
        this.templateText = e.currentTarget.innerHTML;
    };

    onClickedSave = (): void => {
        chrome.storage.sync.set({
            isIncludePrivateEvent: this.isIncludePrivateEvent,
            isIncludeAllDayEvent: this.isIncludeAllDayEvent,
            templateText: this.templateText,
        });
    };

    render(): TemplateResult {
        return html`
            <main>
                <change-show-private-event
                    .isIncludeEvent=${this.isIncludePrivateEvent}
                    .onClickedCheckbox=${this.onChangeShowPrivateEvent}
                ></change-show-private-event>
                <change-show-all-day-event
                    .isIncludeEvent=${this.isIncludeAllDayEvent}
                    .onClickedCheckbox=${this.onChangeShowAllDayEvent}
                ></change-show-all-day-event>
                <editable-template
                    .templateText=${this.templateText}
                    .onBlurTemplate=${this.onBlurTemplate}
                ></editable-template>
                <save-button .onClickedSave=${this.onClickedSave}></save-button>
            </main>
        `;
    }

    static styles = css`
        main {
            min-width: 320px;
            max-height: 560px;
        }
    `;
}
