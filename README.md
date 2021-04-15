# Contoso Airlines Flight Schedule Manager

## IMPORTANT

**This sample has been archived and is no longer being maintained. For a more current sample using Microsoft Graph from ASP.NET Core, please see https://github.com/microsoftgraph/msgraph-training-aspnet-core.**

## Prerequisites

You should already have the [Contoso Airlines Flight Team Provisioning Sample](https://github.com/microsoftgraph/contoso-airlines-azure-functions-sample) sample setup in your tenant.

## Setup

This sample uses three different OAuth flows: Implicit, On Behalf Of, and Client Credential. You'll need to register an application for each flow.

### Register the frontend

The React.js frontend of the sample uses the Implicit flow to login and get access to the backend.

Register an app **Flight Team Manager**.

- Accounts in this organizational directory only
- Redirect URI: Web, `https://localhost:5001`
- On **Authentication** tab, enable **Access tokens** and **ID tokens** under **Implicit grant**
- Add delegated permissions for Graph:
  - **People.Read**
  - **User.Read**
  - **User.ReadBasic.All**
- In **./FlightScheduleManager/ClientApp/.env**, set `REACT_APP_AZURE_APP_ID` to the app ID, and replace `YOUR_TENANT_ID_HERE` with your tenant ID.

### Register the backend

The ASP.NET backend of the sample uses the On Behalf Of flow to access the Graph on behalf of the user logged in to the front end.

Register an app **Flight Team Manager Backend**.

- Accounts in this organizational directory only
- Redirect URI: Web, `https://localhost:5001`
- Add delegated permissions for Graph:
  - **Calendars.Read**
  - **User.Read**
- Create a secret
- On **Expose an API** tab, add a scope named **Flights.ReadWrite** that admins and users can consent. Accept the application ID URI that is generated for you.
- On the **Manifest** tab, find the `knownClientApplications` value and add the app ID for the **Flight Team Manager** app.
- In **./FlightScheduleManager/ClientApp/.env**, set `REACT_APP_AZURE_WEB_APP_ID` to the app ID for **Flight Team Manager Backend**.
- In **./FlightScheduleManager/graphsettings.json**, set `tenantId` to your tenant ID. In the `onBehalfClientSettings`, set `appId` to the app ID for **Flight Team Manager Backend**, and set `appSecret` to the secret you created.

### Update frontend app registration

1. Navigate to the **Flight Team Manager** app registration in the Azure portal.
1. On the **API permissions** tab, choose **Add a permission**.
1. Choose **My APIs**, then choose **Flight Team Manager Backend**.
1. Select the **Flights.ReadWrite** permission and choose **Add permissions**.

### Register the app-only component

The ASP.NET backend of the sample uses the Client Credential flow to make Graph calls that it cannot make on the logged-in user's behalf. For example, non-admin users are not able to list all SharePoint sub-sites.

Register an app **Flight Team Manager App-Only**.

- Accounts in this organizational directory only
- Redirect URI: Web, `https://localhost:5001`
- Add application permissions for Graph:
  - **Directory.Read.All**
  - **Sites.ReadWrite.All**
- After adding the permissions, use the **Grant admin consent for Contoso** button
- Create a secret
- In **./FlightScheduleManager/graphsettings.json**, in the `appOnlyClientSettings`, set `appId` to the app ID for **Flight Team Manager App-Only**, and set `appSecret` to the secret you created.

### Configure SharePoint

In **./FlightScheduleManager/graphsettings.json**, update the following values.

- `flightAdminSite`: Set to the name of the SharePoint site created as part of the setup for the **Contoso Airlines Flight Team Provisioning Sample**.
- `flightList`: Set to the name of the document library created in the SharePoint site.
