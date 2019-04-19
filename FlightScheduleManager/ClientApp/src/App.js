import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Providers } from 'microsoft-graph-toolkit/dist/es6/Providers';
import { MsalProvider } from 'microsoft-graph-toolkit/dist/es6/providers/MsalProvider';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';

initializeIcons();

export default class App extends Component {
  static displayName = App.name;

  constructor(props) {
    super(props);

    let config = {
      clientId: process.env.REACT_APP_AZURE_APP_ID,
      authority: process.env.REACT_APP_AZURE_AUTHORITY,
      scopes: [`api://${process.env.REACT_APP_AZURE_WEB_APP_ID}/.default`]
    };

    Providers.globalProvider = new MsalProvider(config);
  }

  render() {
    return (
      <Layout>
        <Route exact path='/' component={Home} />
      </Layout>
    );
  }
}
