import React from 'react';
import { Link } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import { Groups } from '../../api/groups/groups.js'; // Constants only
import { join, leave } from '../../api/groups/methods.js';

export default class GroupItem extends React.Component {
  constructor(props) {
    super(props);
    this.joinGroup = this.joinGroup.bind(this);
    this.leaveGroup = this.leaveGroup.bind(this);
  }

  joinGroup() {
    const { router } = this.context;
    const groupId = this.props.group._id;
    join.call({ groupId: groupId }, (err) => {
      if (err) {
        alert(err.reason);
      } else {
        router.push(`/groups/${groupId}`);
      }
    });
  }

  leaveGroup() {
    const { router } = this.context;
    const groupId = this.props.group._id;
    leave.call({ groupId: groupId }, (err) => {
      if (err) {
        alert(err.reason);
      } else {
        router.push(`/`);
      }
    });
  }

  render() {
    const { group } = this.props;
    const playersCount = group.getPlayers().length;
    const joined = group.hasPlayer(Meteor.userId());
    const joinable = !joined && !group.isPlaying();
    const linkGroupName = (
      <TableRowColumn>
        {group.name}
        {
          joined ? 
          <Link to={`/groups/${group._id}`} title={group.name} style={{ marginLeft: '10px' }}>
            Visit group
          </Link> : ''
        }
      </TableRowColumn>
    );
    const buttonJoinLeaveGroup = !!Meteor.userId() && (joined || playersCount < Groups.MAX_PLAYERS_COUNT) ? (
      <TableRowColumn>
        <RaisedButton primary={joinable} secondary={!joinable} label={joinable ? 'Join' : 'Leave'} onClick={joinable ? this.joinGroup : this.leaveGroup}></RaisedButton>
      </TableRowColumn>
    ) : (<TableRowColumn></TableRowColumn>);
    return (
      <TableRow selectable={false} key={group._id}>
        {linkGroupName}
        <TableRowColumn>{group.getOwner().username}</TableRowColumn>
        <TableRowColumn>{playersCount}</TableRowColumn>
        <TableRowColumn>{group.isPlaying() ? 'Playing' : playersCount >= Groups.MIN_PLAYERS_COUNT ? 'Ready' : 'Waiting for players'}</TableRowColumn>
        {buttonJoinLeaveGroup}
      </TableRow>
    );
  }

}

GroupItem.propTypes = {
  group: React.PropTypes.object,
};

GroupItem.contextTypes = {
  router: React.PropTypes.object,
};
