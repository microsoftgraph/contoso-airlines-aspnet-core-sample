// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE in the project root for license information.

import React, { Component } from 'react';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { FocusZone } from 'office-ui-fabric-react/lib/FocusZone';
import { List } from 'office-ui-fabric-react/lib/List';
import { Modal } from 'office-ui-fabric-react/lib/Modal';
import { Shimmer, ShimmerElementsGroup, ShimmerElementType } from 'office-ui-fabric-react/lib/Shimmer';
import { FlightTile } from './FlightTile';
import { FlightEditor } from './FlightEditor';
import { Utilities } from '../utilities/utils';
import './FlightManagerView.css';

let ROWS_PER_PAGE = 3;
let MAX_ROW_HEIGHT = 250;

/*
 * This component is the main view for flight admins.
 * It displays a list of upcoming flights
 */

export class FlightManagerView extends Component {
  static displayName = FlightManagerView.name;

  columnCount = 0;
  columnWidth = 0;
  rowHeight = 0;

  constructor(props) {
    super(props);

    this.state = {
      flights: [],
      showFlightModal: false,
      selectedFlight: null,
      isDataLoaded: false
    };
  }

  componentDidMount() {
    this.loadFlights();
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
      <FlightTile tileWidth={`${100 / this.columnCount}%`} flight={item} selectable={true} onSelected={this.onFlightSelected.bind(this, index)} />
    );
  }

  onFlightSelected(index, e) {
    console.log(`Flight #${index} selected`);
    let selectedFlight = this.state.flights[index];

    if (selectedFlight) {
      this.setState({ selectedFlight: selectedFlight});
      this.openFlightModal();
    }
  }

  openFlightModal() {
    this.setState({ showFlightModal: true });
  }

  closeFlightModal(reloadFlights) {
    this.setState({ showFlightModal: false });
    if (reloadFlights) {
      this.loadFlights();
    }
  }

  render() {
    return (
      <div>
        <h1 className="ms-font-su">Flight Manager</h1>
        <Separator/>
        <Shimmer isDataLoaded={this.state.isDataLoaded} customElementsGroup={this.getShimmerElements()} width={1040}>
          <FocusZone>
            <List
              items={this.state.flights}
              getItemCountForPage={this.getItemCountForPage.bind(this)}
              getPageHeight={this.getPageHeight.bind(this)}
              onRenderCell={this.onRenderCell.bind(this)} />
          </FocusZone>
        </Shimmer>
        <Modal
          isOpen={this.state.showFlightModal}
          isBlocking={false}
          onDismiss={this.closeFlightModal.bind(this)}
          containerClassName="flight-editor-container">
          <FlightEditor flight={this.state.selectedFlight} onClose={this.closeFlightModal.bind(this)} />
        </Modal>
      </div>
    );
  }

  getShimmerElements() {
    return (
      <div className="shimmerContainer">
        <ShimmerElementsGroup
          flexWrap={true}
          width='100%'
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
          ]}
        />
      </div>
    );
  }
}