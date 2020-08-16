import { LitElement, html } from 'lit-element';
import '@material/mwc-top-app-bar/mwc-top-app-bar.js';
import '../components/el-plant-list.js';

export class ElViewPlot extends LitElement {
  render() {
    return html`
      <mwc-top-app-bar>
        <mwc-icon-button icon="menu" slot="navigationIcon"></mwc-icon-button>
        <div slot="title">Title</div>
        <mwc-icon-button
          icon="file_download"
          slot="actionItems"
        ></mwc-icon-button>
        <mwc-icon-button icon="print" slot="actionItems"></mwc-icon-button>
        <mwc-icon-button icon="favorite" slot="actionItems"></mwc-icon-button>
        <div><el-plant-list></el-plant-list></div>
      </mwc-top-app-bar>
    `;
  }
}
