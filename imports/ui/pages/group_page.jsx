import React from 'react';
import { Link } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import { Table, TableHeader, TableHeaderColumn, TableBody, TableRow } from 'material-ui/Table';
import Main from '../layouts/main';
import { Groups } from '../../api/groups/groups.js'; // Constants only
import PlayerItem from '../components/player_item.jsx';
import { start, selectMembers, approve, vote } from '../../api/groups/methods.js';

export default class GroupPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedMemberIndices: [] };
    this.start = this.start.bind(this);
    this.restart = this.restart.bind(this);
    this.onRowSelection = this.onRowSelection.bind(this);
    this.selectMembers = this.selectMembers.bind(this);
    this.approve = this.approve.bind(this);
    this.vote = this.vote.bind(this);
  }

  start() {
    const groupId = this.props.group._id;
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

  onRowSelection(selectedRows) {
    let result = selectedRows.slice(0);
    if (result == 'none') {
        result = [];
    }
    this.setState({ selectedMemberIndices: result }, () => { /* Callback function is triggered once the state has been updated */ });
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
      const buttonStart = (
        <div>
          {
            group.getPlayers().length >= Groups.MIN_PLAYERS_COUNT ?
            (
              group.belongsTo(Meteor.userId()) ?
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
          Players:
          <Table multiSelectable={true} onRowSelection={this.onRowSelection}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={selectable}>
              <TableRow>
                <TableHeaderColumn>Name</TableHeaderColumn>
                <TableHeaderColumn>Part</TableHeaderColumn>
                <TableHeaderColumn>Role</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody deselectOnClickaway={false}>
              {group.getPlayers().map((player, i) =>
                <PlayerItem selected={group.isSelectingMembers() && this.state.selectedMemberIndices.indexOf(i) != -1} user={player.user} part={!group.isPlaying() || (Meteor.userId() != player.user._id && !group.hasSpy(Meteor.userId())) ? 'Unknown' : player.isSpy ? 'Spy' : 'Resistance'} role={group.hasLeader(player.user._id) ? group.hasMember(player.user._id) ? 'Leader & Member' : 'Leader' : group.hasMember(player.user._id) ? 'Member' : ''} selectable={selectable} key={player.user._id}/>
              )}
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
