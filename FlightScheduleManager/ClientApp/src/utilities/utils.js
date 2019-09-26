// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE in the project root for license information.

import { Providers } from '@microsoft/mgt';
import moment from 'moment';

export class Utilities {

  static formatDate(date) {
    return moment(date).format('MMM D, h:mm A');
  }

  static async getTokenForAPI() {
    let scopes = ['api://805f28c8-4a55-462b-b065-004c78ece8b9/.default'];

    console.log(`Provider state: ${Providers.globalProvider.state}`);

    try
    {
      let token = await Providers.globalProvider.getAccessToken(...scopes);

      if (token === null) {
        token = await Providers.globalProvider.getAccessToken(...scopes);
      }
      console.log(`Token: ${token}`);
      return token;
    }
    catch (error)
    {
      console.log(`Token error: ${JSON.stringify(error)}`);
    }
  }
}