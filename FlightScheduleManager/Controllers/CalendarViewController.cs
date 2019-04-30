// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE in the project root for license information.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FlightScheduleManager.Graph;
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
            var token = await GraphService.ValidateBearerToken(authorization);
            if (string.IsNullOrEmpty(token))
            {
                return new UnauthorizedResult();
            }

            var events = await GraphService.GetCalendarView(token, start, end);
            if (events != null)
            {
              return events.CurrentPage.ToList();
            }

            return null;
        }
    }
}
