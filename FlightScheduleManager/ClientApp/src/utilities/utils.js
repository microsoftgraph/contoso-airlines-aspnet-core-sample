import { Providers } from 'microsoft-graph-toolkit/dist/es6/Providers';
import moment from 'moment';

export class Utilities {

  static formatDate(date) {
    return moment(date).format('MMM D, h:mm A');
  }

  static async getTokenForAPI() {
    let scopes = ['api://805f28c8-4a55-462b-b065-004c78ece8b9/.default'];

    let token = await Providers.globalProvider.getAccessToken(...scopes);
    return token;
  }
}