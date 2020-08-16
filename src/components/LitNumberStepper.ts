import { html, css, LitElement, property } from 'lit-element';
import '@material/mwc-icon-button';

export class LitNumberStepper extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--lit-number-stepper-text-color, #000);
    }
    mwc-icon-button {
      --mdc-icon-size: var(--lit-number-stepper-icon-size, 36px);
      --mdc-icon-button-size: var(--lit-number-stepper-icon-size, 36px);
      color: var(--lit-number-stepper-icon-color, #000);
    }
    div {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 2.5em;
      height: var(--lit-number-stepper-icon-size, 36px);
      font-size: var(--lit-number-stepper-font-size, medium);
      font-family: var(
        --lit-number-stepper-font-family,
        Arial,
        Helvetica,
        sans-serif
      );
    }
  `;

  @property({ type: String }) taxon = '';

  @property({ type: Number }) counter = 0;

  @property({ type: Number }) minimum = 0;

  @property({ type: Number }) maximum = null;

  @property({ type: Boolean })
  get __isMinimum(): boolean {
    return this.minimum != null && this.counter <= this.minimum!;
  }

  @property({ type: Boolean })
  get __isMaximum(): boolean {
    return this.maximum != null && this.counter >= this.maximum!;
  }

  __increment() {
    if (this.counter !== this.maximum) {
      this.dispatchEvent(new Event('increment'));
    }
  }

  __decrement() {
    if (this.counter !== this.minimum) {
      this.dispatchEvent(new Event('decrement'));
    }
  }

  render() {
    return html`
      <mwc-icon-button @click=${this.__decrement} ?disabled=${this.__isMinimum}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          viewBox="0 0 24 24"
          width="24"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
          />
        </svg>
      </mwc-icon-button>
      <div>${this.counter}</div>
      <mwc-icon-button @click=${this.__increment} ?disabled=${this.__isMaximum}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          viewBox="0 0 24 24"
          width="24"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
          />
        </svg>
      </mwc-icon-button>
    `;
  }
}
