import React from 'react';
import { Link } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import { TableRow, TableRowColumn } from 'material-ui/Table';
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
        router.push(`/groups/${ groupId }`);
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
    const alreadyJoined = group.hasPlayer(Meteor.userId());
    const linkGroupName = (
      <TableRowColumn>
        {group.name}
        { alreadyJoined ? 
          <Link to={ `/groups/${ group._id }` } title={ group.name } style={ { marginLeft: '10px' } }>
            Visit group
          </Link> : ''
        }
      </TableRowColumn>
    );
    const buttonJoinLeaveGroup = !!Meteor.userId() ? (
      <TableRowColumn>
        <RaisedButton primary={!alreadyJoined} secondary={alreadyJoined} label={alreadyJoined ? 'Leave' : 'Join'} onClick={alreadyJoined ? this.leaveGroup : this.joinGroup}></RaisedButton>
      </TableRowColumn>
    ) : (<TableRowColumn></TableRowColumn>);
    return (
      <TableRow selectable={false} key={group._id}>
        {linkGroupName}
        <TableRowColumn>{group.owner().username}</TableRowColumn>
        <TableRowColumn>{group.players().length}</TableRowColumn>
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
