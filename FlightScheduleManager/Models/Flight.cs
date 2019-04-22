using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace FlightScheduleManager.Models
{
    public enum FlightIdType
    {
        SharePointList,
        OutlookCalendar
    }

    [JsonObject(NamingStrategyType = typeof(CamelCaseNamingStrategy))]
    public class Flight
    {
        public FlightIdType IdType { get; set; }
        public string Id { get; set; }
        public int Number { get; set; }
        public string Description { get; set; }
        public DateTime DepartureTime { get; set; }
        public List<string> FlightCrew { get; set; }

        public static Flight FromListItem(ListItem listItem)
        {
            var jsonFields = JsonConvert.SerializeObject(listItem.Fields.AdditionalData);
            var fields = JsonConvert.DeserializeObject<ListFields>(jsonFields);

            if (string.IsNullOrEmpty(fields.Description) ||
                string.IsNullOrEmpty(fields.DepartureGate) ||
                fields.FlightNumber <= 0 ||
                fields.DepartureTime == DateTime.MinValue)
            {
                return null;
            }

            var flight = new Flight
            {
                IdType = FlightIdType.SharePointList,
                Id = $"{listItem.DriveItem.ParentReference.DriveId}/{listItem.DriveItem.Id}",
                Number = (int)fields.FlightNumber,
                Description = fields.Description,
                DepartureTime = fields.DepartureTime,
                FlightCrew = new List<string>()
            };

            foreach (var flightAttendant in fields.FlightAttendants)
            {
                flight.FlightCrew.Add(flightAttendant.Email.ToLower());
            }

            return flight;
        }

        public static Flight FromEvent(Event flightEvent, IList<DirectoryObject> flightAttendants)
        {
            var flightData = flightEvent.Extensions.CurrentPage.FirstOrDefault(e => e.Id.Contains("com.contoso.flightData"));

            if (flightData == null)
            {
                return null;
            }

            var flight = new Flight
            {
                IdType = FlightIdType.OutlookCalendar,
                Id = flightEvent.Id,
                Number = GetFlightNumberFromSubject(flightEvent.Subject),
                Description = flightEvent.Location.DisplayName,
                DepartureTime = DateTime.SpecifyKind(DateTime.Parse(flightEvent.Start.DateTime), DateTimeKind.Utc),
                FlightCrew = new List<string>()
            };

            var crewObj = flightData.AdditionalData.FirstOrDefault(kvp => kvp.Key == "crewMembers");
            var crew = crewObj.Value as JArray;

            foreach (var userId in crew.ToList())
            {
                var flightAttendant = flightAttendants.FirstOrDefault(f => f.Id == userId.Value<string>());
                if (flightAttendant != null)
                {
                    var flightAttendantUser = flightAttendant as User;
                    flight.FlightCrew.Add(flightAttendantUser.Mail);
                }
            }

            return flight;
        }

        private static int GetFlightNumberFromSubject(string subject)
        {
            var flightNumber = Regex.Match(subject, @"\d+").Value;
            return Int32.Parse(flightNumber);
        }
    }
}