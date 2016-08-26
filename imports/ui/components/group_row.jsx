import React from 'react';
import { join, leave } from '../../api/groups/methods.js';
import { MediumAndSmallDevice, TinyDevice } from '../layouts/devices.jsx';

export default class GroupRow extends React.Component {
  constructor(props) {
    super(props);
    this.joinGroup = this.joinGroup.bind(this);
    this.leaveGroup = this.leaveGroup.bind(this);
  }

  // REGION: Component Specifications

  render() {
    const { group, joinedOtherGroup } = this.props;
    const situation = group.getSituation();
    const joinedThisGroup = group.hasPlayer(Meteor.userId());
    const isPlaying = group.isPlaying();
    return (
      <tr>
        <td>
          <a href={`/groups/${group._id}`}><b>{group.name}</b></a>
          <br/>
          <small>Owner: <a href={`/users/${group.getOwner()._id}`}>{group.getOwner().username}</a></small>
        </td>
        <MediumAndSmallDevice>
          <td>
            <ul className="list-inline">
              {group.getPlayers().map(p =>
                <li key={p.user._id}>
                  <a href={`/users/${p.user._id}`}>
                    <img src={p.user.getAvatarSrc()} className="avatar" alt="Avatar" data-container="body" data-toggle="tooltip" title={p.user.username}/>
                  </a>
                </li>
              )}
            </ul>
          </td>
        </MediumAndSmallDevice>
        <td>
          {
            isPlaying ?
              <span className="label label-info">Playing</span> :
              [
                <MediumAndSmallDevice key="small">
                  <span className={`label label-${situation.slot == null ? 'primary' : 'warning'}`}>{situation.status[0]}</span>
                </MediumAndSmallDevice>,
                <TinyDevice key="tiny">
                  <span className={`label label-${situation.slot == null ? 'primary' : 'warning'}`}>{situation.status[0].split(' ')[0]}</span>
                </TinyDevice>
              ]
          }
          {
            situation.slot == false ?
              [
                <br key="br"/>,
                <span key="span" className="label label-default">Full</span>
              ] : null
          }
        </td>
        <td>
          <a href={`/groups/${group._id}`} className="btn btn-sm btn-dark"><i className="fa fa-group"></i> Go to</a>
          {
            !!Meteor.userId() && (joinedThisGroup || situation.slot != false) && !isPlaying ?
              !joinedThisGroup && !isPlaying ?
                !joinedOtherGroup ? <a className="btn btn-sm btn-success" onClick={this.joinGroup}><i className="fa fa-sign-in"></i> Join</a> : null :
                <a className="btn btn-sm btn-danger" onClick={this.leaveGroup}><i className="fa fa-sign-out"></i> Leave</a> : null
          }
        </td>
      </tr>
    );
  }

  // REGION: Lifecycle Methods

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  // REGION: Handlers

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
}

GroupRow.propTypes = {
  group: React.PropTypes.object,
  joinedOtherGroup: React.PropTypes.bool,
};

GroupRow.contextTypes = {
  router: React.PropTypes.object,
};
