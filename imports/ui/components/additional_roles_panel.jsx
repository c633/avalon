import React from 'react';
import { Groups } from '../../api/groups/groups.js'; // Constants only
import RoleCard from '../components/role_card.jsx';
import { start } from '../../api/groups/methods.js';

export default class AdditionalRolesPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedAdditionalRoles: [] };
    this.start = this.start.bind(this);
    this.onRoleCardClick = this.onRoleCardClick.bind(this);
  }

  start() {
    const groupId = this.props.group._id;
    start.call({ groupId: groupId, additionalRoles: this.state.selectedAdditionalRoles, reset: false }, err => {
      if (err) {
        alert(err.reason);
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
              Click to select additional roles if you want (you can only select up to <strong>{group.getEvilPlayersCount() - 1}</strong> additional evil role(s))
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
        </div>
      </div>
    ) : null;
  }
}

AdditionalRolesPanel.propTypes = {
  group: React.PropTypes.object,
};
