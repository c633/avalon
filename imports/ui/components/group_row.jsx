import React from 'react';
import { Groups } from '../../api/groups/groups.js'; // Constants only
import { join, leave } from '../../api/groups/methods.js';

export default class GroupRow extends React.Component {
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
    const situation = group.getSituation();
    const joined = group.hasPlayer(Meteor.userId());
    const isPlaying = group.isPlaying();
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
            isPlaying ?
              <span className="label label-info">Playing</span> :
              <span className={`label label-${situation.slot == null ? 'primary' : 'warning'}`}>{situation.status}</span>
          }
          {
            situation.slot == false ?
              [
                <br key="br"/>,
                <span key="span" className="label label-default">Group is full</span>
              ] : null
          }
        </td>
        <td>
          {
            !!Meteor.userId() && (joined || situation.slot != false) && !isPlaying ?
              !joined && !isPlaying ?
                <a className="btn btn-sm btn-success" onClick={this.joinGroup}><i className="fa fa-sign-in"></i> Join</a> :
                <a className="btn btn-sm btn-danger" onClick={this.leaveGroup}><i className="fa fa-sign-out"></i> Leave</a> : null
          }
          {joined ? <a href={`/groups/${group._id}`} className="btn btn-sm btn-dark"><i className="fa fa-group"></i> Go to</a> : null}
        </td>
      </tr>
    );
  }
}

GroupRow.propTypes = {
  group: React.PropTypes.object,
};

GroupRow.contextTypes = {
  router: React.PropTypes.object,
};
