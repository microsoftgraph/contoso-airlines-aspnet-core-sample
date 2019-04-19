using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FlightScheduleManager.Models;
using Microsoft.Graph;

namespace FlightScheduleManager.Controllers
{
    [Route("api/[controller]")]
    public class SchedulesController : Controller
    {
        // GET /api/flights
        [HttpGet]
        public async Task<ActionResult<List<Schedule>>> GetSchedules(
          [FromHeader] string authorization,
          [FromQuery] string start,
          [FromQuery] string end)
        {
            var schedules = new List<Schedule>();

            var scheduleInfos = new List<ScheduleInformation>
            {
                new ScheduleInformation
                {
                    ScheduleId = "adelev@m365x930361.onmicrosoft.com",
                    AvailabilityView = "0104000022",
                    ScheduleItems = new List<ScheduleItem>
                    {
                        new ScheduleItem {
                          Start = new DateTimeTimeZone { DateTime = "2019-04-16T09:00:00", TimeZone = "UTC" },
                          End = new DateTimeTimeZone { DateTime = "2019-04-16T10:00:00", TimeZone = "UTC" },
                          Status = FreeBusyStatus.Busy
                        }
                    }
                },
                new ScheduleInformation
                {
                    ScheduleId = "alexw@m365x930361.onmicrosoft.com",
                    AvailabilityView = "0400300201",
                    ScheduleItems = new List<ScheduleItem>
                    {
                        new ScheduleItem {
                          Start = new DateTimeTimeZone { DateTime = "2019-04-16T09:00:00", TimeZone = "UTC" },
                          End = new DateTimeTimeZone { DateTime = "2019-04-16T10:00:00", TimeZone = "UTC" },
                          Status = FreeBusyStatus.Busy
                        }
                    }
                }
            };

            foreach (var val in scheduleInfos)
            {
              schedules.Add(new Schedule(val));
            }

            return schedules;
        }
    }
}
