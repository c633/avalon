import React from 'react';
import { Groups } from '../../api/groups/groups.jsx'; // Constants only
import { start } from '../../api/groups/methods.js';
import RoleCard from './role_card.jsx';

export default class RolesContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedAdditionalRoles: [] };
    this.start = this.start.bind(this);
    this.onRoleCardClick = this.onRoleCardClick.bind(this);
  }

  // REGION: Component Specifications

  render() {
    const { group } = this.props;
    return group.hasOwner(Meteor.userId()) && !group.isPlaying() ? (
      <div style={{ borderBottom: '2px solid #E6E9ED' }}>
        <div className="row">
          <div className="col-sm-3 col-xs-12"><div className="avalon-hint"><p>Additional roles</p></div></div>
          <div className="col-sm-9 col-xs-12">
            <div className="avalon-hint">
              {group.findSuggestion(Meteor.userId())}
            </div>
          </div>
        </div>
        <div className="row" style={{ marginBottom: '10px' }}>
          {
            ['Percival', 'Mordred', 'Morgana', 'Oberon'].map(r => {
              const isSelected = this.state.selectedAdditionalRoles.indexOf(r) != -1;
              const isSelectable = isSelected ||
                this.state.selectedAdditionalRoles.filter(r => !Groups.ROLES[r].side).length < group.getEvilPlayersCount() - 1 ||
                (r == 'Percival' && this.state.selectedAdditionalRoles.indexOf('Morgana') != -1);
              return <RoleCard key={r} onClick={() => { if (isSelectable) this.onRoleCardClick(r); }} isSelectable={isSelectable} isSelected={isSelected} role={r}/>;
            })
          }
        </div>
        {
          group.players.length >= Groups.MIN_PLAYERS_COUNT ?
            <div className="form-group">
              <button className="btn btn-success" onClick={this.start}>Start playing</button>
            </div> : null
        }
      </div>
    ) : null;
  }

  // REGION: Handlers

  start() {
    const { group } = this.props;
    start.call({ groupId: group._id, additionalRoles: this.state.selectedAdditionalRoles, reset: false }, err => {
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
      if (role == 'Percival' && selectedAdditionalRoles.indexOf('Morgana') == -1) {
        selectedAdditionalRoles.push('Morgana');
      }
    } else {
      selectedAdditionalRoles.splice(index, 1);
      const percivalIndex = selectedAdditionalRoles.indexOf('Percival');
      if (role == 'Morgana' && percivalIndex != -1) {
        selectedAdditionalRoles.splice(percivalIndex, 1);
      }
    }
    this.setState({ selectedAdditionalRoles: selectedAdditionalRoles });
  }
}

RolesContent.propTypes = {
  group: React.PropTypes.object,
};
