// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE in the project root for license information.

import React, { Component } from 'react';
import { Jumbotron } from 'reactstrap';
import { Providers } from 'microsoft-graph-toolkit/dist/es6/Providers';
import { ProviderState } from 'microsoft-graph-toolkit/dist/es6/providers/IProvider';
import { FlightManagerView } from './FlightManagerView';
import { FlightAttendantView } from './FlightAttendantView';
import { Utilities } from '../utilities/utils';

/*
 * This component is the home page for the app. If a user is signed in,
 * it redirects to the relevant view based on their role.
 */

export class Home extends Component {
  static displayName = Home.name;

  constructor(props) {
    super (props);

    this.state = {
      authenticated: Providers.globalProvider.state === ProviderState.SignedIn,
      user: null,
      loading: false
    };

    Providers.globalProvider.onStateChanged(() => {
      let isAuthenticated = Providers.globalProvider.state === ProviderState.SignedIn;

      if (isAuthenticated !== this.state.authenticated) {
        this.setState({ authenticated: isAuthenticated} );
        this.loadUser();
      }
    });
  }

  componentDidMount() {
    this.loadUser();
  }

  async loadUser() {
    if (this.state.authenticated) {
      this.setState({ loading: true });
      let token = await Utilities.getTokenForAPI();

      let response = await fetch('api/users', {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        let user = await response.json();
        this.setState( { user: user });
        console.log(`User data: ${JSON.stringify(user)}`);
      } else {
        // handle error
      }
    }
  }

  render () {
    if (this.state.authenticated && this.state.user) {
      if (this.state.user.isFlightAdmin) {
        return (
          <FlightManagerView />
        );
      } else {
        return (
          <FlightAttendantView />
        )
      }
    } else {
      return (
        <Jumbotron>
          <h1 className="ms-font-su ms-fontWeight-regular" style={ { paddingBottom: '20px'} }>Contoso Flight Schedule Manager</h1>
          <p className="ms-font-xl">Please sign in to use the app.</p>
        </Jumbotron>
      );
    }
  }
}
