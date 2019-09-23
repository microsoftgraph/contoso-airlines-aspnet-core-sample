// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE in the project root for license information.

import React, { Component } from 'react';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import '@microsoft/mgt';
import { Utilities } from '../utilities/utils';
import './FlightSignupPanel.css';

/*
 * This component is the content for the slide-in panel
 * that is shown when a flight attendant selects an available flight.
 * It displays the current crew and a view of the attendant's calendar for
 * that day so they can decide if they want to sign up for the flight.
 */

export class FlightSignupPanel extends Component {
  static displayName = FlightSignupPanel.name;

  render() {
    return (
      <Stack gap={20}>
        <div className="ms-font-l">{`${this.props.flight.description} - ${Utilities.formatDate(this.props.flight.departureTime)}`}</div>
        <Separator alignContent="center">Current crew</Separator>
        <Stack gap={12}>
        {this.props.flight.flightCrew.map(function(crewMember) {
          return (
            <mgt-person key={crewMember} person-query={crewMember} show-name />
          );
        })}
        </Stack>
        <Separator alignContent="center">Your calendar</Separator>
        <mgt-agenda
          group-by-day
          date={this.props.flight.departureTime}
          days="1">
          <template data-type="no-data">
            <div className="ms-font-l no-events">No events today</div>
          </template>
        </mgt-agenda>
      </Stack>
    );
  }
}