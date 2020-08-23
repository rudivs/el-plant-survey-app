import { LitElement, html, property, css } from 'lit-element';
import '../components/el-plant-list.js';
import '../types/types.js';
import '@material/mwc-top-app-bar/mwc-top-app-bar.js';
import '@material/mwc-dialog/mwc-dialog.js';
import '@material/mwc-textfield/mwc-textfield.js';
import '@material/mwc-textarea/mwc-textarea.js';
import '@material/mwc-radio/mwc-radio.js';
import '@material/mwc-formfield/mwc-formfield.js';
import '@material/mwc-fab/mwc-fab.js';
import type { Button } from '@material/mwc-button/mwc-button.js';
import type { Dialog } from '@material/mwc-dialog/mwc-dialog.js';
import type { TextField } from '@material/mwc-textfield/mwc-textfield.js';
import type { TextArea } from '@material/mwc-textarea/mwc-textarea.js';
import type { Fab } from '@material/mwc-fab/mwc-fab.js';

export class ElViewPlot extends LitElement {
  @property({ type: Number }) latitude = -1;
  @property({ type: Number }) longitude = -1;
  @property({ type: Number }) accuracy = -1;
  @property({ type: Number }) altitude?: number;
  @property({ type: Number }) altitudeAccuracy?: number;
  @property({ type: String }) localityDescription = '';
  @property({ type: String }) habitatDescription = '';
  @property({ type: String }) surveyorName = '';
  @property({ type: String }) siteCondition = '';
  @property({ type: Number }) areaSampled = 0;
  @property({ type: Array }) plotList = new Array<SpeciesRecord>();
  @property() db: PouchDB.Database<{}> = new PouchDB('plant-survey-app');

  get title() {
    return `Plot List${this.gridCode ? `: ${this.gridCode}` : ''}`;
  }

  get gridCode() {
    if (this.latitude === -1 || this.longitude === -1) {
      return null;
    }
    if (this.accuracy > 1000000) {
      // testing only: fix this (set to 100)!!!
      return null;
    }

    const degLat = Math.floor(-this.latitude);
    let minLat = Math.floor((-this.latitude - degLat) * 60);
    if (minLat % 2 == 1) minLat = minLat - 1;
    const degLong = Math.floor(this.longitude);
    let minLong = Math.floor((this.longitude - degLong) * 60);
    if (minLong % 2 == 1) minLong = minLong - 1;

    return `${degLat}${minLat
      .toString()
      .padStart(2, '0')}-${degLong}${minLong.toString().padStart(2, '0')}`;
  }

  constructor() {
    super();

    this.db = new PouchDB('plant-survey-app');
  }

  render() {
    return html`
      <mwc-top-app-bar>
        <mwc-icon-button icon="menu" slot="navigationIcon"></mwc-icon-button>
        <div slot="title">${this.title}</div>
        <mwc-icon-button
          icon="sync"
          slot="actionItems"
          @click=${this._sync}
        ></mwc-icon-button>
        <mwc-icon-button
          icon="post_add"
          slot="actionItems"
          @click=${this._newPlot}
        ></mwc-icon-button>
        <div>
          <mwc-dialog id="plot-dialog" heading="Plot Details">
            <p>Please enter the detials for this plot.</p>
            <mwc-textfield
              id="surveyor-name"
              minlength="3"
              maxlength="64"
              size="40"
              label="Surveyor name"
              required
            >
            </mwc-textfield>
            <mwc-textarea
              id="locality"
              minlength="3"
              maxlength="250"
              label="Locality description"
              cols="42"
              required
            >
            </mwc-textarea>
            <mwc-textarea
              id="habitat"
              minlength="3"
              maxlength="250"
              label="Habitat description"
              cols="42"
              required
            >
            </mwc-textarea>
            <div class="radioBlock">
              <label for="site-condition">Site condition:</label>
              <mwc-formfield label="Good">
                <mwc-radio name="site-condition" value="good"></mwc-radio>
              </mwc-formfield>
              <mwc-formfield label="Fair">
                <mwc-radio name="site-condition" value="fair"></mwc-radio>
              </mwc-formfield>
              <mwc-formfield label="Poor">
                <mwc-radio name="site-condition" value="poor"></mwc-radio>
              </mwc-formfield>
            </div>
            <label for="area-sampled">Area sampled (m²)</label>
            <mwc-textfield
              id="area-sampled"
              name="area-sampled"
              type="number"
              min="10"
              max="100"
              required
            ></mwc-textfield>
            <mwc-button id="confirm-button" slot="primaryAction">
              Confirm
            </mwc-button>
            <mwc-button
              id="cancel-button"
              slot="secondaryAction"
              dialogAction="close"
            >
              Cancel
            </mwc-button>
          </mwc-dialog>
          <div id="plot-metadata" style="visibility:hidden">
            <span><strong>Surveyor:</strong> ${this.surveyorName}</span><br />
            <span><strong>Locality:</strong> ${this.localityDescription}</span
            ><br />
            <span><strong>Habitat:</strong> ${this.habitatDescription}</span
            ><br />
            <span
              ><strong>Coordinates:</strong> ${this.latitude},
              ${this.longitude}</span
            ><br />
            <span><strong>Accuracy:</strong> ${this.accuracy}</span><br />
            <span><strong>Altitude:</strong> ${this.altitude}</span><br />
            <span
              ><strong>Altitude accuracy:</strong> ${this
                .altitudeAccuracy}</span
            ><br />
            <span><strong>Site condition:</strong> ${this.siteCondition}</span
            ><br />
            <span><strong>Area sampled:</strong> ${this.areaSampled}</span
            ><br />
          </div>
          <el-plant-list .data=${this.plotList}></el-plant-list>
          <mwc-fab
            extended
            id="plot-fab"
            icon="save"
            label="Complete"
            style="visibility:hidden"
            @click=${this._save}
          ></mwc-fab>
        </div>
      </mwc-top-app-bar>
    `;
  }

  static styles = css`
    .radioBlock {
      display: block;
    }

    mwc-fab {
      position: fixed;
      bottom: 70px;
      left: 50%;
      transform: translateX(-50%);
    }
  `;

  _sync() {
    const remoteCouch =
      'https://c7fb5858-d195-4676-85fa-a9d39219932f-bluemix:d703e01068c2a38078f0901107e5f498bc7e006359a7906d5ffd6257bbcc9a6f@c7fb5858-d195-4676-85fa-a9d39219932f-bluemix.cloudantnosqldb.appdomain.cloud/plant-survey-app';
    const opts = { live: true };
    //alert('Sync started');
    this.db
      .sync(remoteCouch, opts)
      .on('error', () => {
        console.log('Sync error');
      })
      .on('complete', () => {
        // TODO: sync UX
        alert('Sync complete');
      });
  }

  _newPlot() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          if (position.coords.latitude != null)
            this.latitude = position.coords.latitude;
          if (position.coords.longitude != null)
            this.longitude = position.coords.longitude;
          if (position.coords.accuracy != null)
            this.accuracy = position.coords.accuracy;
          if (position.coords.altitude != null)
            this.altitude = position.coords.altitude;
          if (position.coords.altitudeAccuracy != null)
            this.altitudeAccuracy = position.coords.altitudeAccuracy;
          console.log(`Latitude: ${position.coords.latitude}`);
          console.log(`Longitude: ${position.coords.longitude}`);
          console.log(`Accuracy: ${position.coords.accuracy}`);
          console.log(`Altitude: ${position.coords.altitude}`);
          console.log(`Altitude accuracy: ${position.coords.altitudeAccuracy}`);
          if (this.accuracy < 1000000) this._generatePlotList();
          // testing only: fix this (set to 100)!!!
          else
            alert(
              'Accuracy is worse than 100m. Please wait for a more accurate position.'
            );
        },
        this._positionError,
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      alert('No location set. Please enable location services and try again.');
      console.log('No geolocation available.');
      return;
    }
  }

  _generatePlotList() {
    let speciesList: Array<Species> | undefined;

    const speciesListPromise = this.db
      .get<SpeciesList>('specieslist')
      .then(doc => {
        speciesList = doc.speciesList;
      })
      .catch(err => {
        console.log(err);
        alert(
          `Could not load the target species list. Please sync first and try again.`
        );
        return;
      });

    if (!this.gridCode) {
      alert(
        'Unable to determine grid code (probably location is not accurate enough). Please try again.'
      );
      return;
    }

    let gridList: Array<string> | undefined;

    const gridListPromise = this.db
      .get<GridList>(`plotlist:${this.gridCode}`)
      .then(doc => {
        gridList = doc.speciesList;
      })
      .catch(err => {
        console.log(err);
        alert(
          'Could not load the species list for this grid. Please sync first and try again.'
        );
        return;
      });

    Promise.all([speciesListPromise, gridListPromise]).then(() => {
      this.plotList = gridList?.map(x => {
        const taxon = speciesList?.find(s => s.speciesId === x);
        const speciesRecord = {
          speciesId: x,
          speciesName: taxon?.speciesName ?? 'Unmatched species',
          family: taxon?.family ?? 'Unmatched species',
          habitat: taxon?.habitat ?? 'Unmatched species',
          status: taxon?.status ?? 'Unknown',
          count: 0,
        };
        return speciesRecord;
      }) ?? [
        {
          speciesId: 'xxx',
          speciesName: 'Unmatched species',
          family: 'Unmatched species',
          habitat: 'Unmatched species',
          status: 'Unknown',
          count: 0,
        },
      ];
      this._getPlotDetails();
    });
  }

  _getPlotDetails() {
    const dialog: Dialog = this.shadowRoot.querySelector('#plot-dialog');
    const surveyorField: TextField = this.shadowRoot.querySelector(
      '#surveyor-name'
    );
    const locationField: TextArea = this.shadowRoot.querySelector('#locality');
    const habitatField: TextArea = this.shadowRoot.querySelector('#habitat');
    const areaSampledField: TextArea = this.shadowRoot.querySelector(
      '#area-sampled'
    );
    const confirmButton: Button = this.shadowRoot.querySelector(
      '#confirm-button'
    );
    const cancelButton: Button = this.shadowRoot.querySelector(
      '#cancel-button'
    );
    const metadataSection: HTMLElement = this.shadowRoot.querySelector(
      '#plot-metadata'
    );
    const fab: Fab = this.shadowRoot.querySelector('#plot-fab');

    confirmButton?.addEventListener('click', () => {
      this.shadowRoot.querySelectorAll('mwc-radio').forEach(r => {
        if (r.checked) this.siteCondition = r.value;
      });
      const isValid =
        surveyorField.checkValidity() &&
        locationField.checkValidity() &&
        habitatField.checkValidity() &&
        areaSampledField.checkValidity() &&
        this.siteCondition != '';
      if (isValid) {
        dialog?.close();
        this.surveyorName = surveyorField.value;
        this.localityDescription = locationField.value;
        this.habitatDescription = habitatField.value;
        this.areaSampled = Number(areaSampledField.value);
        metadataSection.style.visibility = 'visible';
        return;
      }

      surveyorField.reportValidity();
      locationField.reportValidity();
      habitatField.reportValidity();
      areaSampledField.reportValidity();
      if (this.siteCondition == '') alert('Please select the site condition');
    });

    cancelButton?.addEventListener('click', () => {
      this.plotList = new Array<SpeciesRecord>();
      this.shadowRoot.querySelectorAll('mwc-radio').forEach(r => {
        if (r.checked) r.checked = false;
      });
      (this.shadowRoot.querySelector('#plot-fab') as Fab).style.visibility =
        'hidden';
      metadataSection.style.visibility = 'visible';
    });

    dialog.open = true;
    fab.style.visibility = 'visible';
  }

  _save() {
    const doc: PlotSubmission = {
      _id: `plotsubmission:${Date.now()}`,
      type: 'plotsubmission',
      surveyorName: this.surveyorName,
      gridCode: this.gridCode,
      latitude: this.latitude,
      longitude: this.longitude,
      positionAccuracy: this.accuracy,
      altitude: this.altitude,
      altitudeAccuracy: this.altitudeAccuracy,
      localityDescription: this.localityDescription,
      habitatDescription: this.habitatDescription,
      siteCondition: this.siteCondition,
      areaSampled: this.areaSampled,
      plotList: this.plotList,
    };
    this.db
      .put<PlotSubmission>(doc)
      .then(() => {
        console.log('plot saved');
        this.latitude = -1;
        this.longitude = -1;
        this.accuracy = -1;
        this.altitude = undefined;
        this.altitudeAccuracy = undefined;
        this.localityDescription = '';
        this.habitatDescription = '';
        this.surveyorName = '';
        this.siteCondition = '';
        this.areaSampled = 0;
        this.plotList = new Array<SpeciesRecord>();
        this.shadowRoot.querySelectorAll('mwc-radio').forEach(r => {
          if (r.checked) r.checked = false;
        });
        (this.shadowRoot.querySelector('#plot-fab') as Fab).style.visibility =
          'hidden';
        (this.shadowRoot.querySelector(
          '#plot-metadata'
        ) as HTMLElement).style.visibility = 'hidden';
        alert(
          'Plot record saved. Remember to sync to upload your list when you have Internet access.'
        );
      })
      .catch(err => {
        console.log(
          `Error submitting plot list for grid ${this.gridCode}: ${err}`
        );
      });
  }

  _positionError(error: any) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.error('User denied the request for Geolocation.');
        break;
      case error.POSITION_UNAVAILABLE:
        console.error('location information is unavailable.');
        break;
      case error.TIMEOUT:
        console.error('The request to get user location timed out.');
        break;
      case error.UNKNOWN_ERROR:
        console.error('An unknown error occurred.');
        break;
    }
  }
}
