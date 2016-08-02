import React from 'react';
import { Groups } from '../../api/groups/groups.js'; // Constants only
import { start } from '../../api/groups/methods.js';
import RoleCard from './role_card.jsx';
import ErrorModal from './error_modal.jsx';

export default class AdditionalRolesPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedAdditionalRoles: [], errorModal: { isShowing: false, reason: '' } };
    this.start = this.start.bind(this);
    this.onRoleCardClick = this.onRoleCardClick.bind(this);
  }

  // REGION: Component Specifications

  render() {
    const { group } = this.props;
    return group.hasOwner(Meteor.userId()) && !group.isPlaying() ? (
      <div className="x_panel">
        <div className="x_title">
          <h2>Additional roles</h2>
          <div className="clearfix"></div>
        </div>
        <div className="x_content">
          <div className="row">
            <div className="col-md-12 col-sm-12 col-xs-12 text-center">
              {group.findSuggestion(Meteor.userId())}
            </div>
            <div className="clearfix"></div>
            {
              [Groups.Roles.PERCIVAL, Groups.Roles.MORDRED, Groups.Roles.MORGANA, Groups.Roles.OBERON].map(r =>
                <RoleCard key={r} onClick={() => this.onRoleCardClick(r)} role={r} selected={this.state.selectedAdditionalRoles.indexOf(r) != -1}/>
              )
            }
          </div>
          {
            group.getPlayers().length >= Groups.MIN_PLAYERS_COUNT ?
              <div className="form-group">
                <button className="btn btn-success" onClick={this.start}>Start playing</button>
              </div> : null
          }
          {this.state.errorModal.isShowing ? <ErrorModal hide={() => this.setState({ errorModal: { isShowing: false } })} reason={this.state.errorModal.reason}/> : null}
        </div>
      </div>
    ) : null;
  }

  // REGION: Handlers

  start() {
    const { group } = this.props;
    start.call({ groupId: group._id, additionalRoles: this.state.selectedAdditionalRoles, reset: false }, err => {
      if (err) {
        this.setState({ errorModal: { isShowing: true, reason: group.findSuggestion(Meteor.userId()) } });
      }
    });
  }

  onRoleCardClick(role) {
    const selectedAdditionalRoles = this.state.selectedAdditionalRoles;
    const index = selectedAdditionalRoles.indexOf(role);
    if (index == -1) {
      selectedAdditionalRoles.push(role);
    } else {
      selectedAdditionalRoles.splice(index, 1);
    }
    this.setState({ selectedAdditionalRoles: selectedAdditionalRoles });
  }
}

AdditionalRolesPanel.propTypes = {
  group: React.PropTypes.object,
};
