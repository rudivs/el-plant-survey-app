import { LitElement, html, css, property } from 'lit-element';
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

  // static styles = css`
  //   :host {
  //     min-height: 100vh;
  //     display: flex;
  //     flex-direction: column;
  //     align-items: center;
  //     justify-content: flex-start;
  //     font-size: calc(10px + 2vmin);
  //     color: #1a2b42;
  //     max-width: 960px;
  //     margin: 0 auto;
  //     text-align: center;
  //   }

  //   main {
  //     width: 100%;
  //   }

  //   .app-footer {
  //     font-size: calc(12px + 0.5vmin);
  //     align-items: center;
  //   }

  //   .app-footer a {
  //     margin-left: 5px;
  //   }
  // `;

  render() {
    return html` ${this._renderCurrentView()} `;
  }
}
