import { LitElement, html, property } from 'lit-element';
import '@material/mwc-top-app-bar/mwc-top-app-bar.js';
import '@material/mwc-dialog/mwc-dialog.js';
//import * as PouchDB from 'pouchdb';
import '../components/el-plant-list.js';

export class ElViewPlot extends LitElement {
  @property({ type: Number }) latitude = -1;
  @property({ type: Number }) longitude = -1;
  @property({ type: Number }) accuracy = -1;
  @property({ type: Number }) altitude?: number;
  @property({ type: Number }) altitudeAccuracy?: number;
  @property({ type: String }) locationDescription = '';
  @property({ type: String }) habitatDescription = '';
  @property({ type: String }) collectorName = '';
  @property() db: PouchDB.Database<{}>;

  get gridCode() {
    if (this.latitude === -1 || this.longitude === -1) {
      alert('No locatiion set. Please enable location services and try again.');
      return null;
    }
    if (this.accuracy > 100) {
      alert(
        'Accuracy is worse than 100m. Please wait for a more accurate position.'
      );
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
    this.sync();
  }

  sync() {
    const remoteCouch = 'http://192.168.132.111:5984/plant-survey-app';
    const opts = { live: true };
    this.db.replicate.to(remoteCouch, opts, () => {
      console.log('Sync error');
    });
    this.db.replicate.from(remoteCouch, opts, () => {
      console.log('Sync error');
    });
    this.db.get('plotlist:2544-2818').then(function (doc) {
      console.log(doc);
    });
  }

  render() {
    return html`
      <mwc-top-app-bar>
        <mwc-icon-button icon="menu" slot="navigationIcon"></mwc-icon-button>
        <div slot="title">Title</div>
        <mwc-icon-button icon="edit" slot="actionItems"></mwc-icon-button>
        <mwc-icon-button
          icon="post_add"
          slot="actionItems"
          @click=${this._newPlot}
        ></mwc-icon-button>
        <div><el-plant-list></el-plant-list></div>
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
          console.log(`Grid code: ${this.gridCode}`);
        },
        this._positionError,
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      alert('No locatiion set. Please enable location services and try again.');
      console.log('No geolocation available.');
    }
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
