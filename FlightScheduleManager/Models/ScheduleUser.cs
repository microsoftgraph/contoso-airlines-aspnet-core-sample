using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace FlightScheduleManager.Models
{
    [JsonObject(NamingStrategyType = typeof(CamelCaseNamingStrategy))]
    public class ScheduleUser
    {
        public string EmailAddress { get; set; }
        public bool IsFlightAdmin { get; set; }
        public bool IsFlightAttendant { get; set; }
    }
}