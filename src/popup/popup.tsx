// import { LitElement, html, customElement, TemplateResult } from 'lit-element';
// import '../components/settingview';

// @customElement('popup-view')
// export class PopupView extends LitElement {
//     render(): TemplateResult {
//         return html`
//             <setting-view></setting-view>
//         `;
//     }
// }
import * as React from 'react';
import * as ReactDOM from 'react-dom';

class App extends React.Component {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    render() {
        return (
            <div>
                <h1>Hello React!</h1>
            </div>
        );
    }
}
ReactDOM.render(<App />, document.getElementById('app'));
