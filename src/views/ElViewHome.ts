import { LitElement, html } from 'lit-element';
import '@material/mwc-button';

export class ElViewHome extends LitElement {
  _loadNewPlot() {
    const myEvent = new CustomEvent('change-view', {
      detail: { view: 'plot' },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(myEvent);
  }

  render() {
    return html`
      <h1>Survey App</h1>
      <mwc-button
        outlined
        label="new plot"
        @click=${this._loadNewPlot}
      ></mwc-button>
    `;
  }
}
