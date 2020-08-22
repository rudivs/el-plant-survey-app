import { LitElement, html, property } from 'lit-element';
import '@material/mwc-top-app-bar/mwc-top-app-bar.js';
import '@material/mwc-dialog/mwc-dialog.js';
//import * as PouchDB from 'pouchdb';
import '../components/el-plant-list.js';
import '../types/types.js';
import { promises } from 'dns';

export class ElViewPlot extends LitElement {
  @property({ type: Number }) latitude = -1;
  @property({ type: Number }) longitude = -1;
  @property({ type: Number }) accuracy = -1;
  @property({ type: Number }) altitude?: number;
  @property({ type: Number }) altitudeAccuracy?: number;
  @property({ type: String }) locationDescription = '';
  @property({ type: String }) habitatDescription = '';
  @property({ type: String }) collectorName = '';
  @property() db: PouchDB.Database<{}> = new PouchDB('plant-survey-app');
  @property({ type: Array }) plotList: Array<SpeciesRecord> = new Array<
    SpeciesRecord
  >();

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
        <div><el-plant-list .data=${this.plotList}></el-plant-list></div>
      </mwc-top-app-bar>
    `;
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
        console.log(gridList);
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

      console.log(this.plotList);
    });
  }

  _positionError(error: any) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.error('User denied the request for Geolocation.');
        break;
      case error.POSITION_UNAVAILABLE:
        console.error('Location information is unavailable.');
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
