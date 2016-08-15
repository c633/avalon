import React from 'react';

export default class UserBrief extends React.Component {
  constructor(props) {
    super(props);
  }

  // REGION: Component Specifications

  render() {
    const { user } = this.props;
    const winTimesCount = user.activities.filter(a => a.result).length;
    const loseTimesCount = user.activities.filter(a => !a.result).length;
    return (
      <div>
        <div className="profile_img">
          <img className="img-responsive avatar-view avalon-avatar" src="/images/avatar.png" alt="Avatar" title="Avatar"/>
          {
            Meteor.userId() == user._id ?
              <label className="btn btn-success btn-file">
                  Change avatar<input type="file" style={{ display: 'none' }}/>
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
}

UserBrief.propTypes = {
  user: React.PropTypes.object,
};
