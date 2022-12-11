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
import '@material/mwc-snackbar/mwc-snackbar.js';
import '@material/mwc-linear-progress';
import type { Button } from '@material/mwc-button/mwc-button.js';
import type { Dialog } from '@material/mwc-dialog/mwc-dialog.js';
import type { TextField } from '@material/mwc-textfield/mwc-textfield.js';
import type { TextArea } from '@material/mwc-textarea/mwc-textarea.js';
import type { Fab } from '@material/mwc-fab/mwc-fab.js';
import type { Snackbar } from '@material/mwc-snackbar/mwc-snackbar.js';
import type { LinearProgress } from '@material/mwc-linear-progress/mwc-linear-progress.js';
import { ElPlantList } from '../components/ElPlantList.js';

enum Mode {
  None,
  List,
  Record,
}

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
  @property({ type: Array }) speciesList = new Array<Species>();
  @property({ type: Array }) plotList = new Array<SpeciesRecord>();
  @property() db: PouchDB.Database<{}> = new PouchDB('plant-survey-app');
  @property({ type: Boolean }) locationSet = false;
  @property({ type: Number }) minimumAccuracy = 150000;
  @property({ type: Mode }) mode = Mode.None;

  get title() {
    return `Plot List${this.gridCode ? `: ${this.gridCode}` : ''}`;
  }

  get gridCode() {
    if (this.latitude === -1 || this.longitude === -1) {
      return null;
    }
    if (this.accuracy > this.minimumAccuracy) {
      return null;
    }

    const degLat = Math.floor(-this.latitude);
    let minLat = Math.floor((-this.latitude - degLat) * 60);
    if (minLat % 2 == 1) minLat = minLat - 1;
    const degLong = Math.floor(this.longitude);
    let minLong = Math.floor((this.longitude - degLong) * 60);
    if (minLong % 2 == 1) minLong = minLong - 1;

    return `${degLat}${minLat.toString().padStart(2, '0')}-${degLong}${minLong
      .toString()
      .padStart(2, '0')}`;
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
          ${this._getPlotDetailsDialog()} ${this._getAddTaxonDialog()}
          <el-plant-list id="plot-list" .data=${this.plotList}></el-plant-list>
          ${this._getFab(this.mode)}
        </div>
      </mwc-top-app-bar>
      <mwc-linear-progress
        id="linear-progress"
        indeterminate
        closed="true"
      ></mwc-linear-progress>
      <mwc-snackbar id="sync-snackbar" labelText="Sync complete"></mwc-snackbar>
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

    .left {
      left: 12%;
      transform: translateX(0%);
    }

    .right {
      right: 5%;
      transform: translateX(50%);
    }
  `;

  _getPlotDetailsDialog() {
    return html` <mwc-dialog id="plot-dialog" heading="Plot Details">
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
    </mwc-dialog>`;
  }

  _getAddTaxonDialog() {
    //returns a dialog for selecting a taxon from the list of available taxa in speciesList

    //if speciesList is empty, first load it from the database
    if (this.speciesList.length == 0) {
      this._loadSpeciesList();
    }

    // filter the list of species to only those that are not already in the plot list
    const availableSpecies = this.speciesList.filter(
      species =>
        !this.plotList.some(plot => plot.speciesId == species.speciesId)
    );

    return html` <mwc-dialog id="add-taxon-dialog" heading="Add taxon">
      <p>Please type the name of the taxon and select to add to this plot.</p>
      <mwc-textfield
        id="taxon-filter"
        maxlength="64"
        size="40"
        label="Filter"
      ></mwc-textfield>
      <el-plant-list
        id="add-taxon-species-list"
        .data=${availableSpecies}
        .filterable=${true}
      ></el-plant-list>
      <mwc-button id="confirm-add-taxon-button" slot="primaryAction">
        Confirm
      </mwc-button>
      <mwc-button
        id="cancel-button"
        slot="secondaryAction"
        dialogAction="close"
      >
        Cancel
      </mwc-button>
    </mwc-dialog>`;
  }

  _getFab(mode: Mode) {
    switch (mode) {
      case Mode.None:
        return '';
      case Mode.List:
        return html`<mwc-fab
          extended
          id="plot-fab"
          icon="play_arrow"
          label="Start Recording"
          @click=${this._getPlotDetails}
        ></mwc-fab>`;
      case Mode.Record:
        // return a material fab button with save icon which saves the plot when clicked
        // and allows the user to add a taxon to the plot when long pressed
        // next to the save button is a button to add a taxon to the plot
        return html`<mwc-fab
            extended
            id="plot-fab"
            icon="save"
            label="Complete"
            class="left"
            @click=${this._savePlot}
          ></mwc-fab>
          <mwc-fab
            id="add-taxon-fab"
            label="Add taxon"
            class="right"
            @click=${this._addTaxon}
            ><mwc-icon slot="icon">add</mwc-icon></mwc-fab
          >`;
    }
  }

  _sync() {
    const remoteCouch =
      'https://c7fb5858-d195-4676-85fa-a9d39219932f-bluemix:d703e01068c2a38078f0901107e5f498bc7e006359a7906d5ffd6257bbcc9a6f@c7fb5858-d195-4676-85fa-a9d39219932f-bluemix.cloudantnosqldb.appdomain.cloud/plant-survey-app';
    const opts = { live: false };
    const linearProgress = this.shadowRoot.getElementById(
      'linear-progress'
    ) as LinearProgress;
    const snackbar = this.shadowRoot.getElementById(
      'sync-snackbar'
    ) as Snackbar;
    linearProgress.open();
    this.db
      .sync(remoteCouch, opts)
      .on('error', () => {
        console.log('Sync error');
        linearProgress.close();
        snackbar.labelText = 'Sync error';
        snackbar.show();
      })
      .on('complete', () => {
        console.log('Sync complete');
        snackbar.labelText = 'Sync complete';
        snackbar.show();
        linearProgress.close();
      });
  }

  _newPlot() {
    if ('geolocation' in navigator) {
      const _this = this;
      this._setLocation(_this).then(() => {
        this._generatePlotList();
        this.mode = Mode.List;
      });
    } else {
      alert('No location set. Please enable location services and try again.');
      console.log('No geolocation available.');
      return;
    }
  }

  async _setLocation(_this: this) {
    _this.locationSet = false;
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => {
          if (position.coords.latitude != null)
            _this.latitude = position.coords.latitude;
          if (position.coords.longitude != null)
            _this.longitude = position.coords.longitude;
          if (position.coords.accuracy != null)
            _this.accuracy = position.coords.accuracy;
          if (position.coords.altitude != null)
            _this.altitude = position.coords.altitude;
          if (position.coords.altitudeAccuracy != null)
            _this.altitudeAccuracy = position.coords.altitudeAccuracy;
          if (_this.accuracy <= _this.minimumAccuracy) {
            _this.locationSet = true;
            console.log(`Location set. Current grid: ${_this.gridCode}.`);
            resolve(position.coords);
          } else {
            alert(
              `Accuracy is worse than ${_this.minimumAccuracy}m. Please wait for a more accurate position.`
            );
            reject(`Accuracy is worse than ${_this.minimumAccuracy}m`);
          }
        },
        error => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }).catch(error => error);
  }

  _generatePlotList() {
    console.log('Generating plot list');

    const speciesListPromise = this._loadSpeciesList();

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
        const taxon = this.speciesList?.find(s => s.speciesId === x);
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
    });
  }

  private _loadSpeciesList() {
    // if the species list is already loaded, return
    if (this.speciesList.length > 0) return;

    return this.db
      .get<SpeciesList>('specieslist')
      .then(doc => {
        this.speciesList = doc.speciesList;
      })
      .catch(err => {
        console.log(err);
        return;
      });
  }

  private _getPlotDetails() {
    const dialog: Dialog = this.shadowRoot.querySelector('#plot-dialog');
    const surveyorField: TextField =
      this.shadowRoot.querySelector('#surveyor-name');
    const locationField: TextArea = this.shadowRoot.querySelector('#locality');
    const habitatField: TextArea = this.shadowRoot.querySelector('#habitat');
    const areaSampledField: TextArea =
      this.shadowRoot.querySelector('#area-sampled');
    const confirmButton: Button =
      this.shadowRoot.querySelector('#confirm-button');
    const cancelButton: Button =
      this.shadowRoot.querySelector('#cancel-button');
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
        this._setLocation(this).then(() => {
          this._generatePlotList();
          this.mode = Mode.Record;
          const plotList = this.shadowRoot.querySelector(
            '#plot-list'
          ) as ElPlantList;
          plotList.counterEnabled = true;
        });
        return;
      }

      surveyorField.reportValidity();
      locationField.reportValidity();
      habitatField.reportValidity();
      areaSampledField.reportValidity();
      if (this.siteCondition == '') alert('Please select the site condition');
    });

    cancelButton?.addEventListener('click', () => {
      this.shadowRoot.querySelectorAll('mwc-radio').forEach(r => {
        if (r.checked) r.checked = false;
      });
    });

    dialog.open = true;
    fab.style.visibility = 'visible';
  }

  private _addTaxon() {
    const dialog: Dialog = this.shadowRoot.querySelector('#add-taxon-dialog');
    const confirmButton: Button = this.shadowRoot.querySelector(
      '#confirm-add-taxon-button'
    );
    const addSpeciesList: ElPlantList = this.shadowRoot.querySelector(
      '#add-taxon-species-list'
    ) as ElPlantList;
    const plotList: ElPlantList = this.shadowRoot.querySelector(
      '#plot-list'
    ) as ElPlantList;
    const filterBox: TextField = this.shadowRoot.querySelector('#taxon-filter');

    // Add event handler to the filter box to set the filter on addSpeciesList when the user types
    filterBox.addEventListener('input', () => {
      addSpeciesList.filter = filterBox.value;
    });

    // When the user clicks the confirm button, add the currently selected taxon in addSpeciesList to the plot list
    confirmButton?.addEventListener('click', () => {
      const selectedTaxon = addSpeciesList.selectedTaxonId;
      if (selectedTaxon) {
        const taxon = this.speciesList?.find(
          s => s.speciesId === selectedTaxon
        );
        const confirmAdd = confirm(
          `Do you want to add ${taxon.speciesName} to the list?`
        );
        if (confirmAdd) {
          plotList.addTaxon(taxon);
          dialog.close();
        }
      } else {
        alert('Please select a taxon to add.');
      }
    });

    dialog.open = true;
  }

  private _savePlot() {
    const date = Date.now();
    const doc: PlotSubmission = {
      _id: `plotsubmission:${date}`,
      type: 'plotsubmission',
      date: new Date(date).toISOString(),
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
      plotList: (this.shadowRoot.querySelector('#plot-list') as ElPlantList)
        .data,
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
        (
          this.shadowRoot.querySelector('#plot-metadata') as HTMLElement
        ).style.visibility = 'hidden';
        alert(
          `Plot record saved(${doc._id}). Remember to sync to upload your list when you have Internet access.`
        );
      })
      .catch(err => {
        console.log(
          `Error submitting plot list for grid ${this.gridCode}: ${err}`
        );
      });
  }

  private _positionError(error: any) {
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
