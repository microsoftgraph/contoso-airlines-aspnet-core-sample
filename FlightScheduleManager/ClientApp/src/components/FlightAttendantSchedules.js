import React, { Component } from 'react';
import { Shimmer, ShimmerElementType } from 'office-ui-fabric-react/lib/Shimmer';
import moment from 'moment';
import { Utilities }  from '../utilities/utils';
import 'office-ui-fabric-react/dist/css/fabric.min.css';
import './FlightAttendantSchedules.css';

/*
 * This component gets a view of all available attendants
 * schedule based on their current calendars
 */

export class FlightAttendantSchedules extends Component {

  constructor(props) {
    super(props);

    this.state = {
      schedules: [],
      isDataLoaded: false
    };
  }

  componentDidMount() {
    this.loadSchedules();
  }

  async loadSchedules() {
    var token = await Utilities.getTokenForAPI();

    let response = await fetch(`api/schedules?start=${this.props.start}&end=${this.props.end}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      let schedules = await response.json();
      this.setState( { schedules: schedules, isDataLoaded: true });
      console.log(`Flight data: ${JSON.stringify(schedules)}`);
    } else {
      // handle error
    }
  }

  static getAdditionalClassesForTimeRow(columnIndex) {
    let classes = `${columnIndex === 2 ? ' in-flight-left' : ''}`;
    classes = `${classes}${(columnIndex >= 2 && columnIndex < 8) ? ' in-flight-top in-flight' : ''}`;
    classes = `${classes}${columnIndex === 7 ? ' in-flight-right' : ''}`;

    return classes;
  }

  static getAdditionalClassesForCrewRow(rowIndex, columnIndex, lastRow) {
    let classes = `${columnIndex === 2 ? ' in-flight-left' : ''}`;
    classes = `${classes}${(columnIndex >= 2 && columnIndex < 8 && rowIndex === lastRow) ? ' in-flight-bottom' : ''}`;
    classes = `${classes}${columnIndex === 7 ? ' in-flight-right' : ''}`;
    classes = `${classes}${(columnIndex >= 2 && columnIndex < 8) ? ' in-flight' : ''}`;

    return classes;
  }

  static getStatusString(status) {
    return status === 'workingElsewhere' ? 'remote' : status;
  }

  onFlightAttendantSelected(index, e) {
    let flightAttendantEmail = this.state.schedules[index].scheduleId;
    this.props.onClick(flightAttendantEmail);
  }

  render() {
    let start = moment(this.props.start);
    let end = moment(this.props.end);

    let numberAvailabilitySlots = end.diff(start, 'minutes') / 30;

    let timeSlotColumns = [];

    for (var i = 0; i < numberAvailabilitySlots; i++) {
      timeSlotColumns.push(
        <div key={i} className={`ms-Grid-col ms-sm1 time-slot-col${FlightAttendantSchedules.getAdditionalClassesForTimeRow(i)}`}>
          <span className="ms-font-m">{start.format('HH:mm')}</span>
        </div>
      );

      start.add(30, 'minutes');
    }

    let lastRow = this.state.schedules.length - 1;

    return(
      <Shimmer isDataLoaded={this.state.isDataLoaded} width={'100%'}
        shimmerElements={[
          { type: ShimmerElementType.line, height: 200, verticalAlign: 'bottom' },
        ]}>
        <div className="ms-Grid schedule-grid">
          <div className="ms-Grid-row time-row">
            <div className="ms-Grid-col ms-sm2" />
            {timeSlotColumns}
          </div>

          {this.state.schedules.map(function(schedule, rowIndex) {
            return (
              <div key={rowIndex} className="ms-Grid-row availability-row">
                <div className="ms-Grid-col ms-sm2 crew-col" onClick={this.onFlightAttendantSelected.bind(this, rowIndex)}>
                  <mgt-person person-query={schedule.scheduleId} show-name />
                </div>
                {schedule.availability.map(function(status, colIndex) {
                  return (
                    <div key={`${rowIndex}-${colIndex}`} className={`ms-Grid-col ms-sm1 availability-col${FlightAttendantSchedules.getAdditionalClassesForCrewRow(rowIndex, colIndex, lastRow)}`}>
                      <div className={`availability-block ${schedule.availability[colIndex]}`}>{FlightAttendantSchedules.getStatusString(schedule.availability[colIndex])}</div>
                    </div>
                  );
                })}
              </div>
            )
          }, this)}
        </div>
      </Shimmer>
    )
  }
}