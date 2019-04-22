using FlightScheduleManager.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.FileExtensions;
using Microsoft.Extensions.Configuration.Json;
using Microsoft.Identity.Client;
using Microsoft.Graph;
using Microsoft.Graph.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace FlightScheduleManager.Graph
{
    public static class GraphService
    {
        private static GraphServiceClient userClient;
        private static GraphServiceClient appClient;
        private static string flightAdminSite;
        private static string flightList;
        private static IConfigurationSection lookupIds;

        static GraphService()
        {
            var graphConfig = LoadAppSettings();
            var oboSettings = graphConfig.GetSection("onBehalfClientSettings");

            var scopes = oboSettings["scopes"];
            var scopesArray = scopes.Split(',');

            // Initialize the Graph client to make calls on behalf of the user
            var userClientCreds = new ClientCredential(oboSettings["appSecret"]);
            var oboMsalClient = OnBehalfOfProvider.CreateClientApplication(oboSettings["appId"],
                oboSettings["redirect"], userClientCreds, null, graphConfig["tenantId"]);
            var oboAuthProvider = new OnBehalfOfProvider(oboMsalClient, scopesArray);

            userClient = new GraphServiceClient(oboAuthProvider);

            var appOnlySettings = graphConfig.GetSection("appOnlyClientSettings");

            // Initialize the Graph client to make app-only calls
            var appClientCreds = new ClientCredential(appOnlySettings["appSecret"]);
            var appMsalClient = ClientCredentialProvider.CreateClientApplication(
                appOnlySettings["appId"], appClientCreds, null, graphConfig["tenantId"]);
            var appAuthProvider = new ClientCredentialProvider(appMsalClient);

            appClient = new GraphServiceClient(appAuthProvider);

            flightAdminSite = graphConfig["flightAdminSite"];
            flightList = graphConfig["flightList"];

            lookupIds = graphConfig.GetSection("sharePointLookupMap");
        }

        private static IConfigurationRoot LoadAppSettings()
        {
            try
            {
                var config = new ConfigurationBuilder()
                .SetBasePath(System.IO.Directory.GetCurrentDirectory())
                .AddJsonFile("graphsettings.json", false, true)
                .Build();

                return config;
            }
            catch (System.IO.FileNotFoundException)
            {
                return null;
            }
        }

        public static string ValidateBearerToken(string authorization)
        {
            try
            {
                var authHeader = AuthenticationHeaderValue.Parse(authorization);

                if (authHeader.Scheme.ToLower() != "bearer")
                {
                    return null;
                }

                return authHeader.Parameter;
            }
            catch (FormatException) { return null; }
            catch (ArgumentNullException) { return null; }
        }

        public static async Task<ScheduleUser> GetUserInfo(string userToken)
        {
            var scheduleUser = new ScheduleUser{ EmailAddress = "", IsFlightAdmin = false, IsFlightAttendant = false };
            try
            {
                var user = await userClient.Me.Request()
                    .WithUserAssertion(new UserAssertion(userToken))
                    .GetAsync();

                scheduleUser.EmailAddress = user.Mail.ToLower();

                // Reading a user's groups requires admin permissions, so
                // use the app-only client here
                var groups = await appClient.Users[user.Id].MemberOf.Request().GetAsync();
                foreach (var obj in groups.CurrentPage)
                {
                    if (obj.ODataType == "#microsoft.graph.group")
                    {
                        var group = obj as Group;
                        if (group.DisplayName == "Flight Admins")
                        {
                            scheduleUser.IsFlightAdmin = true;
                        }

                        if (group.DisplayName == "Flight Attendants")
                        {
                            scheduleUser.IsFlightAttendant = true;
                        }

                        if (scheduleUser.IsFlightAdmin && scheduleUser.IsFlightAttendant)
                        {
                            break;
                        }
                    }
                }
            }
            catch(Exception ex)
            {
                Console.WriteLine($"GetUserInfo - Exception: {ex.ToString()}");
            }

            return scheduleUser;
        }

        public static async Task<List<Flight>> GetAllFlightsFromList()
        {
            var flights = new List<Flight>();

            try
            {
                var items = await GetFlightListItems();

                foreach (var item in items.CurrentPage)
                {
                    flights.Add(Flight.FromListItem(item));
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetAllFlightsFromList - Exception: {ex.ToString()}");
            }

            // SharePoint lists do not support OrderBy via Graph, so sort
            // results here
            var sortedFlights = flights.OrderBy(f => f.DepartureTime).ToList();
            return sortedFlights;
        }

        public static async Task<List<Flight>> GetOpenFlightsFromList(string userEmail)
        {
            var flights = new List<Flight>();

            try
            {
                var items = await GetFlightListItems();

                foreach (var item in items.CurrentPage)
                {
                    var flight = Flight.FromListItem(item);

                    if (flight.FlightCrew.Count < 3 && !flight.FlightCrew.Contains(userEmail))
                    {
                        flights.Add(flight);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetOpenFlightsFromList - Exception: {ex.ToString()}");
            }

            // SharePoint lists do not support OrderBy via Graph, so sort
            // results here
            var sortedFlights = flights.OrderBy(f => f.DepartureTime).ToList();
            return sortedFlights;
        }

        public static async Task<List<Flight>> GetAssignedFlights(string userToken)
        {
            var flights = new List<Flight>();

            try
            {
                // Get the Flight Attendants group members
                var flightAttendants = await GetGroupMembers("Flight Attendants");

                var today = DateTime.UtcNow.Date;

                // Get the flight events from the user's calendar
                var flightEvents = await userClient.Me.Events.Request()
                    .Filter($"start/dateTime ge '{today.ToString("yyyy-MM-ddTHH:mm:ss")}' and categories/any(c:c eq 'Assigned Flight')")
                    .OrderBy("start/dateTime ASC")
                    .Expand("extensions($filter=id eq 'com.contoso.flightData')")
                    .Top(50)
                    .GetAsync();

                foreach (var flightEvent in flightEvents.CurrentPage)
                {
                    flights.Add(Flight.FromEvent(flightEvent, flightAttendants.CurrentPage));
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetAssignedFlights - Exception: {ex.ToString()}");
            }

            return flights;
        }

        public static async Task UpdateFlight(Flight updatedFlight)
        {
            if (updatedFlight.IdType == FlightIdType.SharePointList)
            {
                await UpdateFlightInSharePoint(updatedFlight);
            }
        }

        public static async Task UpdateFlightInSharePoint(Flight updatedFlight)
        {
            var crewLookupIds = new List<string>();

            foreach (var email in updatedFlight.FlightCrew)
            {
                var lookup = GetUserLookupId(email);
                if (!string.IsNullOrEmpty(lookup))
                {
                    crewLookupIds.Add(lookup);
                }
            }

            var flightAttendantField = new FieldValueSet
            {
                AdditionalData = new Dictionary<string,object>
                {
                    { "Flight_x0020_AttendantsLookupId@odata.type", "Collection(Edm.String)" },
                    { "Flight_x0020_AttendantsLookupId", crewLookupIds }
                }
            };

            var spIds = updatedFlight.Id.Split('/');

            await appClient.Drives[spIds[0]].Items[spIds[1]].ListItem.Fields.Request().UpdateAsync(flightAttendantField);
        }

        public static async Task<IUserCalendarViewCollectionPage> GetCalendarView(string userToken, string start, string end)
        {
            try
            {
                // Use QueryOption to pass "custom" query parameters
                // ?startDateTime=2019-04-22T08:00:00&endDateTime=2019-04-29T08:00:00
                var queryOptions = new List<QueryOption> {
                    new QueryOption("startDateTime", start),
                    new QueryOption("endDatetime", end)
                };

                return await userClient.Me.CalendarView
                    .Request(queryOptions)
                    .Select("subject,start,end,categories")
                    .Top(25).GetAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetCalendarView - Exception: {ex.ToString()}");
                return null;
            }
        }

        private static async Task<IListItemsCollectionPage> GetFlightListItems()
        {
            // Get the root site
            var rootSite = await appClient.Sites["root"].Request().GetAsync();

            // Get the flight admin site
            var adminSite = await appClient
                .Sites[$"{rootSite.SiteCollection.Hostname}:/sites/{flightAdminSite}"]
                .Request().GetAsync();

            // Get the flight list
            var lists = await appClient.Sites[adminSite.Id]
                .Lists.Request().Top(50).GetAsync();

            foreach(var list in lists.CurrentPage)
            {
                if (list.Name == flightList)
                {
                    // Get items from the list
                    return await appClient.Sites[adminSite.Id].Lists[list.Id]
                        .Items.Request()
                        // Filter on Departure Time field, only get items with a departure
                        // later than today
                        .Filter($"fields/Departure_x0020_Time ge '{DateTime.UtcNow.Date.ToString("yyyy-MM-ddTHH:mm:ss")}'")
                        // Expand the fields (where all custom fields are returned) and
                        // the driveItem (to make it easier to update this item if needed) properties
                        .Expand("driveItem,fields")
                        .GetAsync();
                }
            }

            Console.WriteLine($"GetFlightListItems - Could not find list named {flightList}");
            return null;
        }

        private static async Task<IGroupMembersCollectionWithReferencesPage> GetGroupMembers(string groupName)
        {
            var group = await appClient.Groups.Request()
                .Filter($"displayName eq '{groupName}'").GetAsync();

            if (group == null)
            {
                Console.WriteLine($"GetGroupMembers - No group named {groupName} found.");
                return null;
            }

            return await appClient.Groups[group.CurrentPage[0].Id]
                .Members.Request().GetAsync();
        }

        private static string GetUserLookupId(string userEmail)
        {
            return lookupIds[userEmail];
        }
    }
}
