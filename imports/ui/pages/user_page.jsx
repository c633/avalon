import React from 'react';
import UserBrief from '../components/user_brief.jsx';
import UserActivity from '../components/user_activity.jsx';

export default class UserPage extends React.Component {
  constructor(props) {
    super(props);
  }

  // REGION: Component Specifications

  render() {
    const { user, loaded } = this.props;
    return loaded ? (
      <div>
        <div className="page-title">
          <div className="title_left">
            <h3>User Profile</h3>
          </div>
        </div>
        <div className="clearfix"></div>
        <div className="row">
          <div className="col-md-12 col-sm-12 col-xs-12">
            <div className="x_panel">
              <div className="x_title">
                <h2>Brief information</h2>
                <div className="clearfix"></div>
              </div>
              <div className="x_content">
                <div className="col-md-3 col-sm-3 col-xs-12 profile_left">
                  <UserBrief user={user}/>
                </div>
                <div className="col-md-9 col-sm-9 col-xs-12">
                  <UserActivity user={user}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null;
  }
}

UserPage.propTypes = {
  user: React.PropTypes.object,
  loaded: React.PropTypes.bool,
};
