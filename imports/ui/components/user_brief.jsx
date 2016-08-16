import React from 'react';
import { changeAvatar } from '../../api/users/methods.js';

export default class UserBrief extends React.Component {
  constructor(props) {
    super(props);
    this.changeAvatar = this.changeAvatar.bind(this);
  }

  // REGION: Component Specifications

  render() {
    const { user } = this.props;
    const winTimesCount = user.activities.filter(a => a.result).length;
    const loseTimesCount = user.activities.filter(a => !a.result).length;
    return (
      <div>
        <div className="profile_img">
          <img className="img-responsive avatar-view avalon-avatar" src={user.getAvatarSrc()} alt="Avatar" title="Avatar"/>
          {
            Meteor.userId() == user._id ?
              <label className="btn btn-success btn-file">
                  Change avatar<input ref="avatar" type="file" onChange={this.changeAvatar} style={{ display: 'none' }}/>
              </label> : null
          }
        </div>
        <h3>{user.username}</h3>
        <h4>Achievement</h4>
        <ul className="list-unstyled user_data">
          <li>
            <div className="progress progress_sm">
              <div className="progress-bar progress-bar-success" role="progressbar" style={{ width: `${winTimesCount / (winTimesCount + loseTimesCount) * 100}%` }}></div>
            </div>
            <p>{winTimesCount} win / {loseTimesCount} lose</p>
          </li>
        </ul>
      </div>
    );
  }

  // REGION: Handlers

  changeAvatar() {
    Cloudinary.upload(this.refs.avatar.files[0], { public_id: Meteor.userId() }, (err, img) => {
      if (!err) {
        changeAvatar.call({ avatarVersion: img.version });
      }
    });
  }
}

UserBrief.propTypes = {
  user: React.PropTypes.object,
};
