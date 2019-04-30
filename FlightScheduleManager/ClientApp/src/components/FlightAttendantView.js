// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE in the project root for license information.

import React, { Component } from 'react';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { AssignedFlights } from './AssignedFlights';
import { AvailableFlights } from './AvailableFlights';
import { FlightSignupPanel } from './FlightSignupPanel';
import { Utilities } from '../utilities/utils';

/*
 * This component is the main view for flight attendants.
 * It displays a read-only list of their assigned flights
 * and a list of flights that they can sign up for
 */

export class FlightAttendantView extends Component {
  static displayName = FlightAttendantView.name;

  constructor(props) {
    super(props);

    this.state = {
      showSignUp: false,
      selectedFlight: null,
      refreshLists: false
    };
  }

  async joinFlight() {
    console.log('Join flight');
    let token = await Utilities.getTokenForAPI();

    let updatedFlight = this.state.selectedFlight;

    let response = await fetch('api/flights?updateType=signup', {
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

    this.onPanelDismissed(true);
  }

  onAvailableFlightSelected(flight) {
    console.log(`Flight selected ${JSON.stringify(flight)}`);
    console.log(`Current state: ${JSON.stringify(this.state)}`);
    this.setState({ showSignUp: true, selectedFlight: flight });
  }

  onPanelDismissed(needsRefresh) {
    let state = {
      showSignUp: false,
      refreshLists: false
    }

    if (needsRefresh) {
      console.log('refresh needed');
      state.refreshLists = true;
    }

    this.setState(state);
  }

  onRenderPanelFooter() {
    return (
      <div>
        <PrimaryButton onClick={this.joinFlight.bind(this)} style={{ marginRight: '8px' }}>
          Sign Up
        </PrimaryButton>
        <DefaultButton onClick={this.onPanelDismissed.bind(this, false)}>
          Cancel
        </DefaultButton>
      </div>
    );
  }

  render() {
    return (
      <div>
        <Stack>
          <h1 className="ms-font-su">Flight Sign-up</h1>
          <Separator/>
          <h2 className="ms-font-xxl">Upcoming flights</h2>
          <AssignedFlights refresh={this.state.refreshLists} />
          <Separator/>
          <h2 className="ms-font-xxl">Available flights</h2>
          <AvailableFlights refresh={this.state.refreshLists} onFlightSelected={this.onAvailableFlightSelected.bind(this)}/>
        </Stack>
        <Panel
          isOpen={this.state.showSignUp}
          type={PanelType.smallFixedFar}
          onDismiss={this.onPanelDismissed.bind(this, false)}
          headerText={`Flight ${this.state.selectedFlight ? this.state.selectedFlight.number : ''}`}
          closeButtonAriaLabel="Close"
          onRenderFooterContent={this.onRenderPanelFooter.bind(this)}
        >
          <FlightSignupPanel flight={this.state.selectedFlight} />
        </Panel>
      </div>
    );
  }
}