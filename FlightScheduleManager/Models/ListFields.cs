using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;

namespace FlightScheduleManager.Models
{
    public class LookupField
    {
        [JsonProperty(PropertyName = "LookupValue")]
        public string DisplayName { get; set; }
        public string Email { get; set; }
    }

    public class ListFields
    {
        [JsonProperty(PropertyName = "Description0")]
        public string Description { get; set; }

        [JsonProperty(PropertyName = "Flight_x0020_Number")]
        public float FlightNumber { get; set; }

        public List<LookupField> Pilots { get; set; }

        [JsonProperty(PropertyName = "Flight_x0020_Attendants")]
        public List<LookupField> FlightAttendants { get; set; }

        [JsonProperty(PropertyName = "Catering_x0020_Liaison")]
        public string CateringLiaison { get; set; }

        [JsonProperty(PropertyName = "Departure_x0020_Time")]
        public DateTime DepartureTime { get; set; }

        [JsonProperty(PropertyName = "Departure_x0020_Gate")]
        public string DepartureGate { get; set; }
    }
}