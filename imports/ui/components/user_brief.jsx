import React from 'react';
import Chart from './chart.jsx';
import { Groups } from '../../api/groups/groups.jsx';
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
    const today = new Date();
    const activities = user.activities.filter(a => a.finishedAt.getYear() == today.getYear() && a.finishedAt.getMonth() == today.getMonth());
    const roleChartData = activities.reduce((c, a) => {
      c[c.findIndex(r => r.role == a.role)].count++;
      return c;
    }, Object.keys(Groups.ROLES).map(r => { return { role: r, count: 0 }; })).map(r => {
      return { label: r.role, value: r.count };
    });
    const hasData = roleChartData.filter(r => r.value > 0).length > 0;
    const roleChartConfig = {
      data: hasData ? roleChartData : [{ label: 'No data', value: 1 }],
      colors: ['#1ABB9C', '#3498DB', '#50C1CF', '#E74C3C', '#9B59B6', '#F39C12', '#34495E', '#9CC2CB'],
      formatter: y => hasData ? y + ' times' : '',
      resize: true
    };
    return (
      <div className="row">
        <div className="col-sm-12 col-xs-6">
          <div className="profile_img">
            <img className="img-responsive avatar-view avalon-avatar" src={user.getAvatarSrc()} alt="Avatar" title="Avatar"/>
            {
              Meteor.userId() == user._id ?
                <label className="btn btn-success btn-file">
                    Change avatar<input ref="avatar" type="file" onChange={this.changeAvatar} style={{ display: 'none' }}/>
                </label> : null
            }
          </div>
        </div>
        <div className="col-sm-12 col-xs-6">
          <h4>Achievement</h4>
          <ul className="list-unstyled user_data">
            <li>
              <div className="progress progress_sm">
                <div className="progress-bar progress-bar-success" role="progressbar" style={{ width: `${winTimesCount / (winTimesCount + loseTimesCount) * 100}%` }}></div>
              </div>
              <p>{winTimesCount} win / {loseTimesCount} lose</p>
            </li>
          </ul>
          <Chart type={Chart.Types.DONUT} config={roleChartConfig}/>
        </div>
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
