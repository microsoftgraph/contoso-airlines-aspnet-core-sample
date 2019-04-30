// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE in the project root for license information.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FlightScheduleManager.Graph;
using FlightScheduleManager.Models;

namespace FlightScheduleManager.Controllers
{
    [Route("api/[controller]")]
    public class FlightsController : Controller
    {
        // GET /api/flights
        [HttpGet]
        public async Task<ActionResult<List<Flight>>> GetFlights(
            [FromHeader] string authorization,
            [FromQuery] string queryType)
        {
            var token = await GraphService.ValidateBearerToken(authorization);
            if (string.IsNullOrEmpty(token))
            {
                return new UnauthorizedResult();
            }

            var callingUser = await GraphService.GetUserInfo(token);

            if (callingUser.IsFlightAdmin)
            {
                // Get all flights from master list
                return await GraphService.GetAllFlightsFromList();
            }
            else
            {
                if (!string.IsNullOrEmpty(queryType) && queryType.ToLower() == "available")
                {
                    // Get flights from master list that have open slots
                    return await GraphService.GetOpenFlightsFromList(callingUser.EmailAddress);
                }
                else
                {
                    // Get current user's flights from calendar
                    return await GraphService.GetAssignedFlights(token);
                }
            }
        }

        [HttpPost]
        public async Task<ActionResult> UpdateFlight(
            [FromHeader] string authorization,
            [FromBody] Flight updatedFlight,
            [FromQuery] string updateType)
        {
            var token = await GraphService.ValidateBearerToken(authorization);
            if (string.IsNullOrEmpty(token))
            {
                return new UnauthorizedResult();
            }

            if (updatedFlight == null)
            {
                return new BadRequestResult();
            }

            if (updateType == "signup")
            {
                // Update from flight attendant signing up for flight
                var callingUser = await GraphService.GetUserInfo(token);

                if (callingUser.IsFlightAttendant)
                {
                    updatedFlight.FlightCrew.Add(callingUser.EmailAddress);
                }
                else
                {
                    return new UnauthorizedResult();
                }
            }

            await GraphService.UpdateFlight(updatedFlight);
            return new AcceptedResult();
        }
    }
}
