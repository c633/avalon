import React from 'react';
import { Link } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import { Table, TableHeader, TableHeaderColumn, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import Main from '../layouts/main';
import { Groups } from '../../api/groups/groups.js'; // Constants only
import PlayerItem from '../components/player_item.jsx';
import { start, selectRoles, selectMembers, approve, vote } from '../../api/groups/methods.js';

export default class GroupPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedMemberIndices: [], selectedAdditionalRoles: [] };
    this.start = this.start.bind(this);
    this.restart = this.restart.bind(this);
    this.onRoleRowSelection = this.onRoleRowSelection.bind(this);
    this.onPlayerRowSelection = this.onPlayerRowSelection.bind(this);
    this.selectRoles = this.selectRoles.bind(this);
    this.selectMembers = this.selectMembers.bind(this);
    this.approve = this.approve.bind(this);
    this.vote = this.vote.bind(this);
  }

  start() {
    const groupId = this.props.group._id;
    this.selectRoles();
    start.call({ groupId: groupId, reset: false }, err => {
      if (err) {
        alert(err.reason);
      }
    });
  }

  restart() {
    const groupId = this.props.group._id;
    start.call({ groupId: groupId, reset: true }, err => {
      if (err) {
        alert(err.reason);
      }
    });
  }

  onPlayerRowSelection(selectedRows) {
    this.setState({ selectedMemberIndices: selectedRows });
  }

  onRoleRowSelection(selectedRows) {
    this.setState({ selectedAdditionalRoles: selectedRows });
  }

  selectRoles() {
    const groupId = this.props.group._id;
    selectRoles.call({ groupId: groupId, selectedAdditionalRoles: this.state.selectedAdditionalRoles.map(r => r == 0 ? Groups.Roles.PERCIVAL : r == 1 ? Groups.Roles.MORDRED : r == 2 ? Groups.Roles.MORGANA : r == 3 ? Groups.Roles.OBERON : Groups.Roles.UNDECIDED) }, err => {
      if (err) {
        alert(err.reason);
      }
    });
  }

  selectMembers() {
    const groupId = this.props.group._id;
    selectMembers.call({ groupId: groupId, selectedMemberIndices: this.state.selectedMemberIndices }, err => {
      if (err) {
        alert(err.reason);
      } else {
        this.setState({ selectedMemberIndices: [] });
      }
    });
  }

  approve(approval) {
    const groupId = this.props.group._id;
    approve.call({ groupId: groupId, userId: Meteor.userId(), approval: approval }, err => {
      if (err) {
        alert(err.reason);
      }
    });
  }

  vote(success) {
    const groupId = this.props.group._id;
    vote.call({ groupId: groupId, userId: Meteor.userId(), success: success }, err => {
      if (err) {
        alert(err.reason);
      }
    });
  }

  render() {
    const { group, loaded } = this.props;
    let content;
    if (loaded) {
      let tableAdditionalRoles;
      if (group.hasOwner(Meteor.userId()) && !group.isPlaying()) {
        tableAdditionalRoles = (
          <div>
            Select additional roles if you want (you can only select up to {group.getEvilPlayersCount() - 1} additional evil role(s))
            <Table multiSelectable={true} onRowSelection={this.onRoleRowSelection}>
              <TableHeader displaySelectAll={false} adjustForCheckbox={true}>
                <TableRow>
                  <TableHeaderColumn>Additional Roles</TableHeaderColumn>
                  <TableHeaderColumn>Side</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody deselectOnClickaway={false}>
                <TableRow selected={this.state.selectedAdditionalRoles.indexOf(0) != -1}>
                  <TableRowColumn>Percival</TableRowColumn><TableRowColumn>Good</TableRowColumn>
                </TableRow>
                <TableRow selected={this.state.selectedAdditionalRoles.indexOf(1) != -1}>
                  <TableRowColumn>Mordred</TableRowColumn><TableRowColumn>Evil</TableRowColumn>
                </TableRow>
                <TableRow selected={this.state.selectedAdditionalRoles.indexOf(2) != -1}>
                  <TableRowColumn>Morgana</TableRowColumn><TableRowColumn>Evil</TableRowColumn>
                </TableRow>
                <TableRow selected={this.state.selectedAdditionalRoles.indexOf(3) != -1}>
                  <TableRowColumn>Oberon</TableRowColumn><TableRowColumn>Evil</TableRowColumn>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        );
      }
      const buttonStart = (
        <div>
          {
            group.getPlayers().length >= Groups.MIN_PLAYERS_COUNT ?
            (
              group.hasOwner(Meteor.userId()) ?
              <div>
                {!group.isPlaying() ? <RaisedButton label='Start playing' onClick={this.start}></RaisedButton> : ''}
                <RaisedButton label='Restart game' onClick={this.restart}></RaisedButton>
              </div> : group.isPlaying() ? 'Playing' : 'Ready'
            ) : ('Waiting')
          }
        </div>
      );
      const history = group.getMissionsHistory().map((m, i) => (
        <div key={i}>Mission {i + 1}: {m.map(t => t === undefined ? 'Playing' : t == null ? 'Denied' : t ? 'Success' : 'Fail').join(', ')}</div>
      ));
      let status;
      if (group.isSelectingMembers()) {
        status = 'Leader is selecting team members';
        if (group.hasLeader(Meteor.userId())) {
          status += ` (Must select ${Groups.MISSIONS_MEMBERS_COUNT[group.players.length][group.missions.length - 1]} members)`;
        }
      } else if (group.isWaitingForApproval()) {
        status = 'Waiting for players to approve the mission team members' + ' (' + group.getLastTeam().approvals.map(a => a == null ? 'undecided' : a == true ? 'approved' : 'denied') + ')';
      } else if (group.isWaitingForVote()) {
        status = 'Team members are going on' + ' (' + group.getLastTeam().successVotes.map(v => v == null ? 'undecided' : v == true ? 'success' : 'fail') + ')';
      }
      const selectable = group.isSelectingMembers() && group.hasLeader(Meteor.userId());
      content = (
        <div>
          <RaisedButton primary={true} containerElement={<Link to="/"/>} linkButton={true} label="Home"/>
          <div>Group's name: {group.name}</div>
          <div>Owner: {group.getOwner().username}</div>
          {buttonStart}
          {tableAdditionalRoles}
          Players:
          <Table multiSelectable={true} onRowSelection={this.onPlayerRowSelection}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={selectable}>
              <TableRow>
                <TableHeaderColumn>Name</TableHeaderColumn>
                <TableHeaderColumn>Role</TableHeaderColumn>
                <TableHeaderColumn>Part</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody deselectOnClickaway={false}>
              {group.getPlayers().map((player, i) => {
                let role;
                if (player.role == Groups.Roles.UNDECIDED) {
                  role = 'Undecided';
                } else {
                  const otherPlayer = Meteor.userId() != player.user._id;
                  switch (group.findPlayerRole(Meteor.userId())) {
                  case Groups.Roles.SERVANT:
                    role = otherPlayer ? 'Unknown' : 'Servant';
                    break;
                  case Groups.Roles.MERLIN:
                    role = otherPlayer ? player.role > 0 || player.role == Groups.Roles.MORDRED ? 'Good' : 'Evil' : 'Merlin';
                    break;
                  case Groups.Roles.PERCIVAL:
                    role = otherPlayer ? player.role == Groups.Roles.MERLIN || player.role == Groups.Roles.MORGANA ? 'Merlin' : 'Unknown' : 'Percival';
                    break;
                  case Groups.Roles.MINION:
                    role = otherPlayer ? player.role > 0 || player.role == Groups.Roles.OBERON ? 'Good' : 'Evil' : 'Minion';
                    break;
                  case Groups.Roles.ASSASSIN:
                    role = otherPlayer ? player.role > 0 || player.role == Groups.Roles.OBERON ? 'Good' : 'Evil' : 'Assassin';
                    break;
                  case Groups.Roles.MORDRED:
                    role = otherPlayer ? player.role > 0 || player.role == Groups.Roles.OBERON ? 'Good' : 'Evil' : 'Mordred';
                    break;
                  case Groups.Roles.MORGANA:
                    role = otherPlayer ? player.role > 0 || player.role == Groups.Roles.OBERON ? 'Good' : 'Evil' : 'Morgana';
                    break;
                  case Groups.Roles.OBERON:
                    role = otherPlayer ? 'Unknown' : 'Oberon';
                    break;
                  }
                }
                return <PlayerItem selected={group.isSelectingMembers() && this.state.selectedMemberIndices.indexOf(i) != -1} selectable={selectable} user={player.user} role={role} part={group.hasLeader(player.user._id) ? group.hasMember(player.user._id) ? 'Leader & Member' : 'Leader' : group.hasMember(player.user._id) ? 'Member' : ''} key={player.user._id}/>
              })}
            </TableBody>
          </Table>
          {history}
          {status}
          <div>
            {selectable ? <RaisedButton label='Select members' onClick={this.selectMembers}></RaisedButton> : ''}
            {group.isWaitingForApproval() ? <div><RaisedButton label='Approve' onClick={() => this.approve(true)}></RaisedButton><RaisedButton label='Deny' onClick={() => this.approve(false)}></RaisedButton></div> : '' }
            {group.isWaitingForVote() && group.hasMember(Meteor.userId()) ? <div><RaisedButton label='Vote Success' onClick={() => this.vote(true)}></RaisedButton><RaisedButton label='Vote Fail' onClick={() => this.vote(false)}></RaisedButton></div> : '' }
          </div>
        </div>
      );
    }
    return <Main content={content}/>;
  }
}

GroupPage.propTypes = {
  group: React.PropTypes.object,
  loaded: React.PropTypes.bool,
};
