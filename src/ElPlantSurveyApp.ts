import { LitElement, html, property } from 'lit-element';
import './views/el-view-home.js';
import './views/el-view-plot.js';

export class ElPlantSurveyApp extends LitElement {
  @property({ type: String }) currentView: 'home' | 'plot' = 'plot';

  @property({ type: String }) title = 'Plant Survey';

  _renderCurrentView() {
    switch (this.currentView) {
      case 'home':
        return html`<el-view-home
          @change-view="${(e: { detail: { view: 'home' | 'plot' } }) =>
            (this.currentView = e.detail.view)}"
        ></el-view-home>`;
      case 'plot':
        return html`<el-view-plot
          @change-view="${(e: { detail: { view: 'home' | 'plot' } }) =>
            (this.currentView = e.detail.view)}"
        ></el-view-plot>`;
    }
  }

  render() {
    return html` ${this._renderCurrentView()} `;
  }
}
