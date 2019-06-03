# Contoso Airlines Flight Schedule Manager

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
- `sharePointLookupMap`: Set to key-value pairs in the format `"useremail": "lookupid"`. To get these values, see the next section.

Currently SharePoint doesn't offer an API on the Graph to find users' lookup values. These values vary from site-to-site, so you must find them for the flight admin site specifically.

1. Create a new document in the document library specified in the `flightList` value.
1. Fill in the custom fields. In the **Flight Attendants** field, add *all* of the members of the **Flight Attendants** group.
1. In your browser, go to [Graph Explorer](https://developer.microsoft.com/graph/graph-explorer) and login with an admin account that has access to the flight admin site.
1. Make a GET request to the following URL: `https://graph.microsoft.com/v1.0/sites/{YOUR-SHAREPOINT-DOMAIN}:/sites/{YOUR-FLIGHT-ADMIN-SITE}`.
1. In the response, copy the value of the `id` property. Use this value in the upcoming steps wherever you see `{SITE-ID}`
1. Make a GET request to the following URL: `https://graph.microsoft.com/v1.0/sites/{SITE-ID}/lists`.
1. In the response, find the value with its `name` property set to the name of your flight list, and copy the value of its `id` property. Use this value in the upcoming steps wherever you see `{LIST-ID}`.
1. Make a GET request to the following URL: `https://graph.microsoft.com/v1.0/sites/{SITE-ID}/lists/{LIST-ID}/items?$expand=fields`.
1. In the response, find the document you created. Find the `FlightAttendants` value and get the email and lookup ID values from there. For example:

    ```json
    "FlightAttendants": [
        {
            "LookupId": 11,
            "LookupValue": "Alex Wilber",
            "Email": "AlexW@M365x041882.OnMicrosoft.com"
        },
        {
            "LookupId": 14,
            "LookupValue": "Emily Braun",
            "Email": "EmilyB@M365x041882.OnMicrosoft.com"
        }
    ]
    ```
