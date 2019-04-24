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
        [JsonProperty(PropertyName = "Description")]
        public string Description { get; set; }

        [JsonProperty(PropertyName = "FlightNumber")]
        public float FlightNumber { get; set; }

        public List<LookupField> Pilots { get; set; }

        [JsonProperty(PropertyName = "FlightAttendants")]
        public List<LookupField> FlightAttendants { get; set; }

        [JsonProperty(PropertyName = "CateringLiaison")]
        public string CateringLiaison { get; set; }

        [JsonProperty(PropertyName = "DepartureTime")]
        public DateTime DepartureTime { get; set; }

        [JsonProperty(PropertyName = "DepartureGate")]
        public string DepartureGate { get; set; }
    }
}