import React from 'react';
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
    join.call({ groupId: groupId }, err => {
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
    leave.call({ groupId: groupId }, err => {
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
    const isPlaying = group.isPlaying();
    const joinable = !joined && !isPlaying;
    return (
      <tr>
        <td>
          <a>{group.name}</a>
          <br/>
          <small>Owner: {group.getOwner().username}</small>
        </td>
        <td>
          <ul className="list-inline">
            {group.getPlayers().map(p =>
              <li key={p.user._id}><img src="images/avatar.png" className="avatar" alt="Avatar"/></li>
            )}
          </ul>
        </td>
        <td>
          {
            group.isPlaying() ?
              <span className="label label-default">Playing</span> :
              playersCount >= Groups.MIN_PLAYERS_COUNT ? 
                <span className="label label-warning">Ready</span> :
                <span className="label label-primary">Waiting for more players</span>
          }
        </td>
        <td>
          {
            !!Meteor.userId() && (joined || playersCount < Groups.MAX_PLAYERS_COUNT) && !isPlaying ?
              joinable ?
                <a className="btn btn-sm btn-success" onClick={this.joinGroup}><i className="fa fa-sign-in"></i> Join </a> :
                <a className="btn btn-sm btn-danger" onClick={this.leaveGroup}><i className="fa fa-sign-out"></i> Leave </a> : ''
          }
          {
            joined ? <a href={`/groups/${group._id}`} className="btn btn-sm btn-info" ><i className="fa fa-group"></i> Go to </a> : ''
          }
        </td>
      </tr>
    );
  }

}

GroupItem.propTypes = {
  group: React.PropTypes.object,
};

GroupItem.contextTypes = {
  router: React.PropTypes.object,
};
