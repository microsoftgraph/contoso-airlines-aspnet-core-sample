import React, { Component } from 'react';
import { Utilities } from '../utilities/utils';
import 'office-ui-fabric-react/dist/css/fabric.min.css';
import './FlightTile.css';

/*
 * This component renders a "tile" for a flight,
 * displaying details on the flight and color-coding
 * it based on the number of assigned flight attendants.
 */

export class FlightTile extends Component {
  render() {
    let flight = this.props.flight;

    let colorClass = 'flight-crew-insufficient';
    if (flight.flightCrew.length === 2) {
      colorClass = 'flight-crew-minimum';
    } else if (flight.flightCrew.length > 2) {
      colorClass = 'flight-crew-optimal';
    }

    return(
      <div
        className="flight-tile"
        data-is-focusable={true}
        style={{
          width: this.props.tileWidth
        }}>
        <div className={`flight-tile-padded ${colorClass} ${this.props.selectable ? 'flight-tile-selectable' : ''}`} onClick={this.props.onSelected}>
          <div className="ms-font-xxl">Flight {this.props.flight.number}</div>
          <div className="ms-font-l">{this.props.flight.description}</div>
          <div className="ms-font-l">{Utilities.formatDate(this.props.flight.departureTime)}</div>
        </div>
      </div>
    );
  }
}