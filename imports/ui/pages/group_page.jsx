import React from 'react';
import { Link } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import { Table, TableHeader, TableHeaderColumn, TableBody, TableRow } from 'material-ui/Table';
import Main from '../layouts/main';
import { Groups } from '../../api/groups/groups.js'; // Constants only
import PlayerItem from '../components/player_item.jsx';
import { start, selectMembers } from '../../api/groups/methods.js';

export default class GroupPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedMemberIndices: [] };
    this.start = this.start.bind(this);
    this.restart = this.restart.bind(this);
    this.onRowSelection = this.onRowSelection.bind(this);
    this.selectMembers = this.selectMembers.bind(this);
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
    var result = selectedRows.slice(0);
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
      let status;
      if (group.missions.length > 0) {
        let message;
        if (group.lastMissionIsSelectingMembers()) {
          message = 'Leader is selecting team members';
        } else if (group.lastMissionIsWaitingForApproval()) {
          message = 'Waiting for approval';
        } else {
          message = 'Team members are going on';
        }
        status = `Mission ${group.missions.length}: ${message}`;
      }
      content = (
        <div>
          <RaisedButton primary={true} containerElement={<Link to="/"/>} linkButton={true} label="Home"/>
          <div>Group's name: {group.name}</div>
          <div>Owner: {group.getOwner().username}</div>
          {buttonStart}
          Players:
          <Table multiSelectable={true} onRowSelection={this.onRowSelection}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn>Name</TableHeaderColumn>
                <TableHeaderColumn>Part</TableHeaderColumn>
                <TableHeaderColumn>Role</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody deselectOnClickaway={false}>
              {[...group.getPlayers().entries()].map(([i, player]) =>
                <PlayerItem selected={group.lastMissionIsSelectingMembers() && this.state.selectedMemberIndices.indexOf(i) != -1} user={player.user} part={!group.isPlaying() || (Meteor.userId() != player.user._id && !group.hasSpy(Meteor.userId())) ? 'Unknown' : player.isSpy ? 'Spy' : 'Resistance'} role={group.lastMissionHasLeader(player.user._id) ? 'Leader' : group.lastMissionHasMember(player.user._id) ? 'Member' : ''} selectable={group.lastMissionIsSelectingMembers() && group.lastMissionHasLeader(Meteor.userId()) && Meteor.userId() != player.user._id} key={player.user._id}/>
              )}
            </TableBody>
          </Table>
          {status}
          {group.lastMissionIsSelectingMembers() && group.lastMissionHasLeader(Meteor.userId()) ? <RaisedButton label='Select members' onClick={this.selectMembers}></RaisedButton> : ''}
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
