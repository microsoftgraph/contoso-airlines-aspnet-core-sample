// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE in the project root for license information.

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