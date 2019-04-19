import React, { Component } from 'react';
import { FocusZone } from 'office-ui-fabric-react/lib/FocusZone';
import { List } from 'office-ui-fabric-react/lib/List';
import { Shimmer, ShimmerElementType } from 'office-ui-fabric-react/lib/Shimmer';
import { FlightTile } from './FlightTile';
import { Utilities } from '../utilities/utils';

let ROWS_PER_PAGE = 3;
let MAX_ROW_HEIGHT = 250;

/*
 * This component gets the authenticated user's flights
 * from their calendar
 */

export class AssignedFlights extends Component {
  static displayName = AssignedFlights.name;

  columnCount = 0;
  columnWidth = 0;
  rowHeight = 0;

  constructor(props) {
    super(props);

    this.state = {
      flights: [],
      isDataLoaded: false
    };
  }

  componentDidMount() {
    this.loadFlights();
  }

  componentWillReceiveProps(props) {
    if (this.props.refresh !== props.refresh)
    {
      this.setState({ isDataLoaded: false });
      this.loadFlights();
    }
  }

  async loadFlights() {
    let token = await Utilities.getTokenForAPI();

    let response = await fetch('api/flights', {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.ok) {
      let flights = await response.json();
      this.setState( { flights: flights, isDataLoaded: true });
      console.log(`Flight data: ${JSON.stringify(flights)}`);
    } else {
      // handle error
    }
  }

  getItemCountForPage(itemIndex, surfaceRect) {
    if (itemIndex === 0)
    {
      this.columnCount = Math.ceil(surfaceRect.width / MAX_ROW_HEIGHT);
      this.columnWidth = Math.floor(surfaceRect.width / this.columnCount);
      this.rowHeight = this.columnWidth;
    }

    return this.columnCount * ROWS_PER_PAGE;
  }

  getPageHeight() {
    return this.rowHeight * ROWS_PER_PAGE;
  }

  onRenderCell(item, index) {
    return(
      <FlightTile tileWidth={`${100 / this.columnCount}%`} flight={item} />
    );
  }

  render() {
    return (
      <Shimmer
        isDataLoaded={this.state.isDataLoaded}
        width={1040}
        shimmerElements={[
          { type: ShimmerElementType.line, width: 200, height: 200, verticalAlign: 'bottom' },
          { type: ShimmerElementType.gap, width: 10, height: 200 },
          { type: ShimmerElementType.line, width: 200, height: 200, verticalAlign: 'bottom' },
          { type: ShimmerElementType.gap, width: 10, height: 200 },
          { type: ShimmerElementType.line, width: 200, height: 200, verticalAlign: 'bottom' },
          { type: ShimmerElementType.gap, width: 10, height: 200 },
          { type: ShimmerElementType.line, width: 200, height: 200, verticalAlign: 'bottom' },
          { type: ShimmerElementType.gap, width: 10, height: 200 },
          { type: ShimmerElementType.line, width: 200, height: 200, verticalAlign: 'bottom' }
        ]}>
        <FocusZone>
          <List
            items={this.state.flights}
            getItemCountForPage={this.getItemCountForPage.bind(this)}
            getPageHeight={this.getPageHeight.bind(this)}
            onRenderCell={this.onRenderCell.bind(this)} />
        </FocusZone>
      </Shimmer>
    );
  }
}