import React, { Component } from 'react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import moment from 'moment';
import 'office-ui-fabric-react/dist/css/fabric.min.css';
import './FlightEditor.css';
import { FlightCrewMember } from './FlightCrewMember';
import { FlightAttendantSchedules } from './FlightAttendantSchedules';
import { Utilities } from '../utilities/utils';

/*
 * This component is a modal dialog that is shown when a
 * flight admin edits a flight. It allows them to add or remove
 * flight attendants
 */

export class FlightEditor extends Component {

  originalCrew = [];

  constructor(props) {
    super(props);

    this.originalCrew = this.props.flight.flightCrew.slice(0);

    this.state = {
      flightCrew: this.props.flight.flightCrew.slice(0),
      isModified: false,
      hideDialog: true
    };
  }

  isCrewModified(currentCrew) {
    // If length is different it must be modified
    if (currentCrew.length !== this.originalCrew.length) {
      return true;
    }

    for (var i = 0; i < currentCrew.length; i++)
    {
      // If an item is in one array but not the other,
      // crew is modified
      if (this.originalCrew.indexOf(currentCrew[i]) === -1) {
        return true;
      }
    }

    return false;
  }

  onCrewMemberRemoved(index, e) {
    if (index < this.state.flightCrew.length)
    {
      let crew = this.state.flightCrew;
      crew.splice(index, 1);

      let isModified = this.isCrewModified(crew);

      this.setState({ flightCrew: crew, isModified: isModified });
    }
  }

  onCrewMemberAdded(crewEmail, e) {
    console.log(`Add: ${crewEmail}`);
    if (this.state.flightCrew.indexOf(crewEmail) === -1) {
      let crew = this.state.flightCrew;
      crew.push(crewEmail);

      let isModified = this.isCrewModified(crew);

      this.setState({ flightCrew: crew, isModified: isModified });
    }
  }

  async onUpdateFlight(e) {
    this.setState({ hideDialog: false });
    let token = await Utilities.getTokenForAPI();

    let updatedFlight = this.props.flight;
    updatedFlight.flightCrew = this.state.flightCrew;

    let response = await fetch('api/flights', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedFlight)
    });

    if (!response.ok) {
      console.log(`Error updating flight: ${response.status}`);
    }

    this.props.onClose(true);
  }

  render() {
    let flight = this.props.flight;

    let viewStart = moment(flight.departureTime).subtract(1, 'hours');
    let viewEnd = moment(flight.departureTime).add(4, 'hours');

    return (
      <div>
        <Dialog
          hidden={this.state.hideDialog}
          dialogContentProps={{
            type: DialogType.normal
          }}
          modalProps={{
            isBlocking: true,
            styles: { main: { maxWidth: 450 } }
          }}
        >
          <Spinner label="Updating flight..." size={SpinnerSize.large} />
        </Dialog>
        <div className="ms-Grid ms-fontColor-white ms-bgColor-themePrimary title-bar" dir="ltr">
          <div className="ms-Grid-row title-row">
            <div className="ms-Grid-col ms-sm3 ms-font-su">
              <span id="flightModalTitle">{`Flight ${flight.number}`}</span>
            </div>
            <div className="ms-Grid-col ms-sm3 ms-font-xxl">
              <span id="flightModalDescription">{flight.description}</span>
            </div>
            <div className="ms-Grid-col ms-sm3 ms-font-xxl">{Utilities.formatDate(flight.departureTime)}</div>
            <div className="ms-Grid-col ms-sm3 button-column">
              <IconButton className="right-justify ms-fontColor-white" iconProps={{ iconName: 'Accept' }} disabled={!this.state.isModified} onClick={this.onUpdateFlight.bind(this)} title="Update" ariaLabel="Update" />
              <IconButton className="right-justify right-margin ms-fontColor-white" iconProps={{ iconName: 'Cancel' }} onClick={this.props.onClose} title="Cancel" ariaLabel="Cancel" />
            </div>
          </div>
        </div>
        <div className="ms-Grid flight-crew-bar">
          <div className="ms-Grid-row flight-crew-row">
            <FlightCrewMember userId={this.state.flightCrew.length > 0 ? this.state.flightCrew[0] : null } onRemove={this.onCrewMemberRemoved.bind(this, 0)} />
            <FlightCrewMember userId={this.state.flightCrew.length > 1 ? this.state.flightCrew[1] : null } onRemove={this.onCrewMemberRemoved.bind(this, 1)}/>
            <FlightCrewMember userId={this.state.flightCrew.length > 2 ? this.state.flightCrew[2] : null } onRemove={this.onCrewMemberRemoved.bind(this, 2)}/>
          </div>
        </div>
        <div className="separator-pad">
          <Separator className="ms-font-xl">Available Flight Attendants</Separator>
        </div>
        <FlightAttendantSchedules start={viewStart.toISOString()} end={viewEnd.toISOString()} onClick={this.onCrewMemberAdded.bind(this)} />
      </div>
    );
  }
}