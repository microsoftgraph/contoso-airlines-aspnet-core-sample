import React, { Component } from 'react';
import { FocusZone } from 'office-ui-fabric-react/lib/FocusZone';
import { List } from 'office-ui-fabric-react/lib/List';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import moment from 'moment';
import { Utilities } from '../utilities/utils';
import './CalendarView.css';

/*
 * This component gets a calendar view for the
 * authenticated user
 */

export class CalendarView extends Component {
  static displayName = CalendarView.name;

  constructor(props) {
    super(props);

    this.state = {
      timeslots: [],
      isDataLoaded: false
    };
  }

  componentDidMount() {
    this.loadEvents();
  }

  async loadEvents() {

    console.log(`Provided departure: ${this.props.departureTime}`);

    let flightStart = moment(this.props.departureTime);
    let flightEnd = moment(flightStart).add(3, 'hours');

    // Day of the flight at 5 AM
    let time = moment(flightStart)
      .hours(5).minutes(0).seconds(0);

    let viewEnd = moment(time).hours(23);

    let token = await Utilities.getTokenForAPI();

    let response = await fetch(`api/calendarview?start=${time.format("Y-MM-DDTHH:mm:ss")}&end=${viewEnd.format("Y-MM-DDTHH:mm:ss")}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      let events = await response.json();

      let timeslots = [];
      // Go through each 30 minute slot and determine which events
      // fall in that time
      for (var i = 0; i < 36; i++) {
        let timeslot = {
          isDuringFlight: time.isBetween(flightStart, flightEnd, null, '[)'),
          time: time.minutes() === 0 ? time.format("h a") : '',
          events: this.getEventsInSlot(time, events)
        };

        timeslots.push(timeslot);
        time.add(30, 'minutes');
      }

      this.setState({ timeslots: timeslots, isDataLoaded: true });
    } else {
      // handle error
    }
  }

  getEventsInSlot(time, events) {
    let eventsInSlot = [];

    console.log(`Checking ${time.format()}`);

    for (var i = 0; i < events.length; i++) {
      let eventStart = moment.utc(events[i].start.dateTime);
      let eventEnd = moment.utc(events[i].end.dateTime);

      console.log(`Checking event ${events[i].subject}: start: ${eventStart.format()}, end: ${eventEnd.format()}`)

      if (time.isBetween(eventStart, eventEnd, null, '[)'))
      {
        console.log(`Found event in slot ${time.format()}`);
        eventsInSlot.push(events[i].subject);
      }
    }

    return eventsInSlot;
  }

  getEventColumns(events) {
    if (events.length === 0) {
      return <div className="ms-Grid-col ms-sm9 ms-font-s" />
    }

    let colSize = '';

    switch (events.length) {
      case 0:
        return <div className="ms-Grid-col ms-sm9 ms-font-s" />
        break;
      case 2:
        colSize = 'ms-sm4';
        break;
      case 3:
        colSize = 'ms-sm3';
        break;
      default:
        colSize = 'ms-sm9'
    }

    if (events.length > 3)
    {
      return (
        <div className="ms-Grid-col ms-sm9 ms-font-s slot-occupied">
          {`${events.length} events`}
        </div>
      );
    }

    let divs = [];
    for (var i = 0; i < events.length; i++)
    {
      divs.push(
        <div key={`evt-${i}`} title={events[i]} className={`ms-Grid-col ${colSize} ms-font-s slot-occupied`}>
          {events[i]}
        </div>
      )
    }

    return divs;
  }

  onRenderCell(item, index) {
    return (
      <div key={`cal-${index}`} className={item.isDuringFlight ? 'in-flight' : ''}>
        <div className="ms-Grid">
          <div className="ms-Grid-row time-row">
            <div className="ms-Grid-col ms-sm3 ms-font-s ms-textAlignRight">{item.time}</div>
            {this.getEventColumns(item.events)}
          </div>
        </div>
        <Separator/>
      </div>
    );
  }

  render() {
    return (
      <div>
        <FocusZone>
          <List items={this.state.timeslots} onRenderCell={this.onRenderCell.bind(this)} />
        </FocusZone>
      </div>
    );
  }
}