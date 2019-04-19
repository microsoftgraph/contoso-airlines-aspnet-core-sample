using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using Microsoft.Graph;

namespace FlightScheduleManager.Models
{
    [JsonObject(NamingStrategyType = typeof(CamelCaseNamingStrategy))]
    public class Schedule
    {
        public string ScheduleId { get; set; }
        public List<FreeBusyStatus> Availability { get; set; }

        public Schedule(ScheduleInformation scheduleInfo)
        {
            this.ScheduleId = scheduleInfo.ScheduleId;
            LoadAvailabilityMap(scheduleInfo.AvailabilityView);
        }

        private void LoadAvailabilityMap(string map)
        {
            var mapArray = map.ToCharArray();
            this.Availability = new List<FreeBusyStatus>();

            foreach(var value in mapArray)
            {
                this.Availability.Add((FreeBusyStatus)int.Parse(value.ToString()));
            }
        }
    }
}