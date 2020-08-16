import { LitElement, html, css, property } from 'lit-element';
import './lit-number-stepper.js';
import '@material/mwc-list/mwc-list.js';
import '@material/mwc-list/mwc-list-item.js';

export class ElPlantList extends LitElement {
  constructor() {
    super();

    this.data = [
      {
        id: '0bfe32d4-8a28-4f7e-bcaa-fc88228b59b8',
        speciesName: 'Metarungia longistrobus',
        habitat:
          'Wet to dry forested kloofs and steep rocky slopes, often associated with scree or drainage lines.',
        family: 'Acanthaceae',
        status: 'LC',
        count: 0,
      },
      {
        id: '8f35906c-e104-4e2d-a96f-a88c99c91c63',
        speciesName: 'Chlorophytum aridum',
        habitat: 'Rocky places in dry bushveld.',
        family: 'Agavaceae',
        status: 'LC',
        count: 1,
      },
      {
        id: 'e8dc08ab-e7be-45f6-a7a9-a23530b82213',
        speciesName: 'Ceropegia rendallii',
        habitat: 'Rocky outcrops in bushveld and grassland.',
        family: 'Apocynaceae',
        status: 'LC',
        count: 0,
      },
      {
        id: '79c70061-bd51-4ea9-86c7-b5781c6a2fd0',
        speciesName: 'Helichrysum mixtum',
        habitat: 'Rocky slopes in grassland and woodland.',
        family: 'Asteraceae',
        status: 'LC',
        count: 0,
      },
      {
        id: '955c1f61-d09f-4d61-8d44-86e32bfd77bd',
        speciesName: 'Helichrysum mutabile',
        habitat:
          'Transitional areas between Lowveld savanna and escarpment grassland, where it occurs on rocky slopes in woodland, or in grassland near forest margins, rarely in marshy places.',
        family: 'Asteraceae',
        status: 'LC',
        count: 0,
      },
      {
        id: '98c3dda0-e96b-4360-8aec-9d04df871aaf',
        speciesName: 'Polydora steetziana',
        habitat:
          'Sandy soils in open woodland, wooded grasslands, streamsides or disturbed places such as old lands.',
        family: 'Asteraceae',
        status: 'LC',
        count: 0,
      },
      {
        id: '6202d4c3-32ce-48ae-b1dd-3da2a611f005',
        speciesName: 'Cleome monophylla',
        habitat:
          'Sandy soil in open woodland, often a weed of disturbed places.',
        family: 'Brassicaceae',
        status: 'LC',
        count: 0,
      },
      {
        id: 'c122110a-d789-4bb6-9496-bcd8b039e89d',
        speciesName: 'Maerua rosmarinoides',
        habitat:
          'Dry thornveld, valley bushveld, riverine thicket and forest margins.',
        family: 'Brassicaceae',
        status: 'LC',
        count: 0,
      },
      {
        id: 'fbdea62a-c06a-4fe5-8137-2ec458e1076c',
        speciesName: 'Pterocelastrus echinatus',
        habitat:
          'Margins of montane or submontane evergreen forest on rocky slopes in grasslands 600-2400m.',
        family: 'Celastraceae',
        status: 'LC',
        count: 0,
      },
      {
        id: '8ea456f8-73da-4c2a-a876-3769798229df',
        speciesName: 'Dioscorea quartiniana',
        habitat:
          'Found in a broad range of habitats, from forest to grassland and rocky areas, 0-1700m.',
        family: 'Dioscoreaceae',
        status: 'LC',
        count: 0,
      },
      {
        id: '47cf33d3-1e65-49fe-a338-617d86cc9206',
        speciesName: 'Dioscorea sylvatica',
        habitat:
          'Wooded and relatively mesic places, such as the moister bushveld areas, coastal bush and wooded mountain kloofs.',
        family: 'Dioscoreaceae',
        status: 'VU',
        count: 0,
      },
      {
        id: '60ce43b6-96ac-4452-94bd-86c5c39330ec',
        speciesName: 'Jatropha latifolia',
        habitat: 'Among rocks on grassy flats, woodland, and mopani veld.',
        family: 'Euphorbiaceae',
        status: 'LC',
        count: 4,
      },
      {
        id: '505116e8-75bc-4623-862f-5782fa628ed7',
        speciesName: 'Chamaeacrista mimosoides',
        habitat:
          'Occurs in a wide variety of habitats, generally a weed of disturbed areas.',
        family: 'Fabaceae',
        status: 'LC',
        count: 45,
      },
      {
        id: '55aba272-1f68-4551-a942-877998efc565',
        speciesName: 'Rhynchosia minima',
        habitat:
          'Grassland, mopane woodland, thornveld, riverine areas, sandy lake shores and pan margins.',
        family: 'Fabaceae',
        status: 'LC',
        count: 0,
      },
      {
        id: 'e6464ebc-d2cd-4cc9-9fb8-783aa2b45f04',
        speciesName: 'Vachellia nilotica',
        habitat:
          'Dry thornveld, river valley scrub, woodland, bushveld and scrub.',
        family: 'Fabaceae',
        status: 'LC',
        count: 0,
      },
      {
        id: '8f595eb2-dde6-4b54-bc76-8b80dbca9b82',
        speciesName: 'Streptocarpus fasciatus',
        habitat: 'Shady woodland, among granite boulders.',
        family: 'Gesneriaceae',
        status: 'VU',
        count: 0,
      },
    ];
  }

  @property({ type: Array }) data: {
    id: string;
    speciesName: string;
    habitat: string;
    family: string;
    status: string;
    count: number;
  }[];

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
        ${this.data.sort(compare).map(
          taxon =>
            html`<mwc-list-item graphic="avatar" hasMeta twoline>
                <span slot="graphic"
                  >${taxon.family?.substring(0, 3).toUpperCase()}
                </span>
                <span>${taxon.speciesName} (${taxon.status})</span>
                <lit-number-stepper
                  slot="meta"
                  .taxon=${taxon.speciesName}
                  .counter=${taxon.count}
                  @increment=${(e: Event) =>
                    this._updateTaxonCount(e, taxon.id, 1)}
                  @decrement=${(e: Event) =>
                    this._updateTaxonCount(e, taxon.id, -1)}
                >
                </lit-number-stepper>
                <span slot="secondary">${taxon.habitat}</span>
              </mwc-list-item>
              <li divider role="separator"></li>`
        )}
      </mwc-list>
    `;
  }

  async _updateTaxonCount(e: any, changedTaxon: string, updateVal: number) {
    const count = e.target.counter + updateVal;
    this.data = this.data.map(taxon => {
      if (taxon.id !== changedTaxon) {
        return taxon;
      }
      const tempData = { ...taxon, count };
      return tempData;
    });
  }
}
