import { LitElement, html, css, property } from 'lit-element';
import './lit-number-stepper.js';
import '@material/mwc-list/mwc-list.js';
import '@material/mwc-list/mwc-list-item.js';
import '../types/types.js';
import { ListItemBase } from '@material/mwc-list/mwc-list-item-base.js';
import { LitNumberStepper } from './LitNumberStepper.js';
import { ListBase } from '@material/mwc-list/mwc-list-base.js';

export class ElPlantList extends LitElement {
  @property({ type: Array }) data: Array<SpeciesRecord> | undefined;
  @property({ type: Boolean }) counterEnabled = false;
  @property({ type: String }) filter = '';
  @property({ type: Boolean }) filterable = false;
  private _selectedTaxonId: string | undefined;

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

  get selectedTaxonId() {
    return this._selectedTaxonId;
  }

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

    const filteredData =
      (this.filterable && this.filter.length > 2
        ? this.data?.filter(taxon =>
            taxon.speciesName
              .toLowerCase()
              .startsWith(this.filter.toLowerCase())
          )
        : []) || [];

    return html`
      <mwc-list @selected=${this._updateSelected}>
        ${(this.filterable ? filteredData : this.data)
          .sort(compare)
          .map(taxon => this._getListItem(taxon))}
      </mwc-list>
    `;
  }

  addTaxon(taxon: Species) {
    // add a taxon to the list
    if (!this.data) {
      this.data = [];
    }
    // exit if taxon already exists
    if (this.data.find(t => t.speciesId === taxon.speciesId)) {
      return;
    }
    this.data.push({
      speciesId: taxon.speciesId,
      speciesName: taxon.speciesName,
      family: taxon.family,
      habitat: taxon.habitat,
      status: taxon.status,
      count: 0,
    });

    this.requestUpdate();
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

  _updateSelected(e: any) {
    const list = e.currentTarget as ListBase;
    const selectedTaxon = list.selected as ListItemBase;
    this._selectedTaxonId = selectedTaxon.dataset.taxonId;
  }

  _getListItem(taxon: SpeciesRecord) {
    // returns a material web component that can be used to display a list item for a taxon

    return html`<mwc-list-item
        graphic="avatar"
        hasMeta
        twoline
        data-taxon-id=${taxon.speciesId}
      >
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
      <li divider role="separator"></li>`;
  }
}
