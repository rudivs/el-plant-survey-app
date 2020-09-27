import { LitElement, html, css, property } from 'lit-element';
import './lit-number-stepper.js';
import '@material/mwc-list/mwc-list.js';
import '@material/mwc-list/mwc-list-item.js';
import '../types/types.js';

export class ElPlantList extends LitElement {
  @property({ type: Array }) data: Array<SpeciesRecord> | undefined;
  @property({ type: Boolean }) counterEnabled = false;

  static styles = css`
    mwc-list-item {
      --mdc-list-item-meta-size: lkj;
      text-align: left;
    }
    lit-number-stepper {
      width: 110px;
      --lit-number-stepper-icon-size: 30px;
    }
  `;

  render() {
    function compare(
      a: { count: number; family: string; speciesName: string },
      b: { count: number; family: string; speciesName: string }
    ) {
      const hasCountA = a.count > 0 ? 1 : 0;
      const hasCountB = b.count > 0 ? 1 : 0;

      if (hasCountA > hasCountB) return -1;
      else if (hasCountA < hasCountB) return 1;

      if (a.family?.toUpperCase() > b.family?.toUpperCase()) return 1;
      else if (a.family?.toUpperCase() < b.family?.toUpperCase()) return -1;

      if (a.speciesName?.toUpperCase() > b.speciesName?.toUpperCase()) return 1;
      else if (a.speciesName?.toUpperCase() < b.speciesName?.toUpperCase())
        return 1;

      return 0;
    }

    return html`
      <mwc-list>
        ${this.data?.sort(compare).map(
          taxon =>
            html`<mwc-list-item graphic="avatar" hasMeta twoline>
                <span slot="graphic"
                  >${taxon.family?.substring(0, 3).toUpperCase()}
                </span>
                <span>${taxon.speciesName} (${taxon.status})</span>
                ${this.counterEnabled
                  ? html`<lit-number-stepper
                      slot="meta"
                      .taxon=${taxon.speciesName}
                      .counter=${taxon.count}
                      @increment=${(e: Event) =>
                        this._updateTaxonCount(e, taxon.speciesId, 1)}
                      @decrement=${(e: Event) =>
                        this._updateTaxonCount(e, taxon.speciesId, -1)}
                    >
                    </lit-number-stepper>`
                  : ''}
                <span slot="secondary">${taxon.habitat}</span>
              </mwc-list-item>
              <li divider role="separator"></li>`
        )}
      </mwc-list>
    `;
  }

  async _updateTaxonCount(e: any, changedTaxon: string, updateVal: number) {
    const count = e.target.counter + updateVal;
    this.data = this.data?.map(taxon => {
      if (taxon.speciesId !== changedTaxon) {
        return taxon;
      }
      const tempData = { ...taxon, count };
      return tempData;
    });
  }
}
