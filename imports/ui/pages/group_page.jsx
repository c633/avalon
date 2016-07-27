import React from 'react';
import { Link } from 'react-router';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppCanvas from 'material-ui/internal/AppCanvas';
import RaisedButton from 'material-ui/RaisedButton';
import { Table, TableHeader, TableHeaderColumn, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import { Groups } from '../../api/groups/groups.js'; // Constants only
import PlayerItem from '../components/player_item.jsx';
import { start, selectRoles, selectMembers, approve, vote, guess } from '../../api/groups/methods.js';

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
    this.guess = this.guess.bind(this);
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

  guess() {
    const groupId = this.props.group._id;
    guess.call({ groupId: groupId, merlinIndex: this.state.selectedMemberIndices[0] }, err => {
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
    let content = null;
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
      let situation;
      if (group.isSelectingMembers()) {
        situation = 'Leader is selecting team members';
        if (group.hasLeader(Meteor.userId())) {
          situation += ` (Must select ${Groups.MISSIONS_MEMBERS_COUNT[group.players.length][group.missions.length - 1]} members)`;
        }
      } else if (group.isWaitingForApproval()) {
        situation = 'Waiting for players to approve the mission team members';
      } else if (group.isWaitingForVote()) {
        situation = 'Waiting for team members to vote for the mission success or fail';
      } else if (group.isWaitingForGuessing()) {
        situation = 'Waiting for Assassin to guess Merlin\'s identity';
      } else if (group.isPlaying()) {
        situation = group.getResult() ? 'Good players win' : 'Evil players win';
      }
      const isGuessing = group.isWaitingForGuessing() && group.findPlayerRole(Meteor.userId()) == Groups.Roles.ASSASSIN;
      const selectable = group.isSelectingMembers() && group.hasLeader(Meteor.userId()) || isGuessing;
      content = (
        <MuiThemeProvider muiTheme={getMuiTheme()}>
        <AppCanvas>
        <div>
          <div>Group's name: {group.name}</div>
          <div>Owner: {group.getOwner().username}</div>
          {buttonStart}
          {tableAdditionalRoles}
          Players:
          <Table multiSelectable={!isGuessing} onRowSelection={this.onPlayerRowSelection}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={selectable}>
              <TableRow>
                <TableHeaderColumn>Name</TableHeaderColumn>
                <TableHeaderColumn>Role</TableHeaderColumn>
                <TableHeaderColumn>Part</TableHeaderColumn>
                <TableHeaderColumn>Status</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody deselectOnClickaway={false}>
              {group.getPlayers().map((player, i) => {
                const otherPlayer = Meteor.userId() != player.user._id;
                let role;
                let side = null;
                if (player.role == Groups.Roles.UNDECIDED) {
                  role = 'Undecided';
                } else {
                  switch (group.findPlayerRole(Meteor.userId())) {
                  case Groups.Roles.SERVANT:
                    [role, side] = otherPlayer ? ['Unknown', null] : ['Servant', true];
                    break;
                  case Groups.Roles.MERLIN:
                    [role, side] = otherPlayer ? player.role > 0 || player.role == Groups.Roles.MORDRED ? ['Good', true] : ['Evil', false] : ['Merlin', true];
                    break;
                  case Groups.Roles.PERCIVAL:
                    [role, side] = otherPlayer ? player.role == Groups.Roles.MERLIN || player.role == Groups.Roles.MORGANA ? ['Merlin', true] : ['Unknown', null] : ['Percival', true];
                    break;
                  case Groups.Roles.MINION:
                    [role, side] = otherPlayer ? player.role > 0 || player.role == Groups.Roles.OBERON ? ['Good', true] : ['Evil', false] : ['Minion', false];
                    break;
                  case Groups.Roles.ASSASSIN:
                    [role, side] = otherPlayer ? player.role > 0 || player.role == Groups.Roles.OBERON ? ['Good', true] : ['Evil', false] : ['Assassin', false];
                    break;
                  case Groups.Roles.MORDRED:
                    [role, side] = otherPlayer ? player.role > 0 || player.role == Groups.Roles.OBERON ? ['Good', true] : ['Evil', false] : ['Mordred', false];
                    break;
                  case Groups.Roles.MORGANA:
                    [role, side] = otherPlayer ? player.role > 0 || player.role == Groups.Roles.OBERON ? ['Good', true] : ['Evil', false] : ['Morgana', false];
                    break;
                  case Groups.Roles.OBERON:
                    [role, side] = otherPlayer ? ['Unknown', null] : ['Oberon', false];
                    break;
                  }
                }
                let status;
                if (group.isWaitingForApproval()) {
                  const approval = group.getLastTeam().approvals[i];
                  status = approval == null ? 'Undecided' : approval ? 'Approved' : 'Denied';
                }
                if (group.isWaitingForVote()) {
                  const vote = group.getLastTeam().successVotes[group.getLastTeam().memberIndices.indexOf(i)];
                  status = vote === undefined ? '' : otherPlayer ? 'Going on mission' : vote == null ? 'Undecided' : vote ? 'Voted Success' : 'Voted Fail';
                }
                return <PlayerItem selected={(group.isSelectingMembers() || group.isWaitingForGuessing()) && this.state.selectedMemberIndices.indexOf(i) != -1} selectable={selectable} user={player.user} role={role} side={side} part={group.hasLeader(player.user._id) ? group.hasMember(player.user._id) ? 'Leader & Member' : 'Leader' : group.hasMember(player.user._id) ? 'Member' : ''} status={status} key={player.user._id}/>
              })}
            </TableBody>
          </Table>
          {history}
          {situation}
          <div>
            {selectable && !isGuessing ? <RaisedButton label='Select members' onClick={this.selectMembers}></RaisedButton> : ''}
            {group.isWaitingForApproval() ? <div><RaisedButton label='Approve' onClick={() => this.approve(true)}></RaisedButton><RaisedButton label='Deny' onClick={() => this.approve(false)}></RaisedButton></div> : '' }
            {group.isWaitingForVote() && group.hasMember(Meteor.userId()) && group.findPlayerRole(Meteor.userId()) < 0 ? <div><RaisedButton label='Vote Success' onClick={() => this.vote(true)}></RaisedButton><RaisedButton label='Vote Fail' onClick={() => this.vote(false)}></RaisedButton></div> : '' }
            {isGuessing ? <div><RaisedButton label='Guess Merlin' onClick={this.guess}></RaisedButton></div> : '' }
          </div>
        </div>
      </AppCanvas>
      </MuiThemeProvider>
      );
    }
    return content;
  }
}

GroupPage.propTypes = {
  group: React.PropTypes.object,
  loaded: React.PropTypes.bool,
};
