import React, { Component } from 'react';
import UserMenu from '../components/user_menu';
import Main from '../layouts/main';
import Groups from '../components/groups.jsx';

export default class Lobby extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { user, groups } = this.props;
    const content = (
      <div>
        <UserMenu user={user}/>
        <Groups groups={groups}/>
      </div>
    );
    return <Main content={content}/>;
  }
}

Lobby.propTypes = {
  user: React.PropTypes.object,       // current meteor user
  groups: React.PropTypes.array,      // all groups
};
