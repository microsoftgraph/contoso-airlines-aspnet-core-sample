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
    public class CalendarViewController : Controller
    {
        // GET /api/calendarview
        public async Task<ActionResult<List<Event>>> GetCalendarView(
          [FromHeader] string authorization,
          [FromQuery] string start,
          [FromQuery] string end)
        {
            return new List<Event> {
              new Event
              {
                Subject = "Test event",
                Start = new DateTimeTimeZone { DateTime = "2019-04-17T10:00:00", TimeZone = "Pacific Standard Time" },
                End = new DateTimeTimeZone { DateTime = "2019-04-17T11:00:00", TimeZone = "Pacific Standard Time" },
                Categories = new List<string> { "Assigned Flight "}
              },
              new Event
              {
                Subject = "Test event",
                Start = new DateTimeTimeZone { DateTime = "2019-04-17T10:30:00", TimeZone = "Pacific Standard Time" },
                End = new DateTimeTimeZone { DateTime = "2019-04-17T11:30:00", TimeZone = "Pacific Standard Time" },
                Categories = new List<string> { "Assigned Flight "}
              },
              new Event
              {
                Subject = "Test event",
                Start = new DateTimeTimeZone { DateTime = "2019-04-17T10:30:00", TimeZone = "Pacific Standard Time" },
                End = new DateTimeTimeZone { DateTime = "2019-04-17T11:30:00", TimeZone = "Pacific Standard Time" },
                Categories = new List<string> { "Assigned Flight "}
              },
              new Event
              {
                Subject = "Test event",
                Start = new DateTimeTimeZone { DateTime = "2019-04-17T10:30:00", TimeZone = "Pacific Standard Time" },
                End = new DateTimeTimeZone { DateTime = "2019-04-17T11:30:00", TimeZone = "Pacific Standard Time" },
                Categories = new List<string> { "Assigned Flight "}
              }
            };
        }
    }
}
