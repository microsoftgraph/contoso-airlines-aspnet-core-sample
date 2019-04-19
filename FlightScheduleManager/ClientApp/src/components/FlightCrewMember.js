import React, { Component } from 'react';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import 'office-ui-fabric-react/dist/css/fabric.min.css';
import './FlightCrewMember.css';

function RemoveButtonIfNeeded(props) {
  if (props.buttonNeeded) {
    return (
      <IconButton className="remove-button" iconProps={{ iconName: 'Cancel' }} onClick={props.onClick} title="Remove" ariaLabel="Remove" />
    )
  }

  return null;
}

/*
 * This component renders a flight crew "slot" in the
 * flight editor. If the slot is empty, it renders a red box.
 */

export class FlightCrewMember extends Component {
  render() {
    return (
      <div className={`ms-Grid-col ms-sm4 flight-crew-col${this.props.userId ? '' : ' ms-bgColor-redDark ms-fontColor-white' }`}>
        <RemoveButtonIfNeeded buttonNeeded={this.props.userId} onClick={this.props.onRemove} />
        <mgt-person person-query={this.props.userId} show-name show-email />
      </div>
    );
  }
}