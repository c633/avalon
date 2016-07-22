import React, { Component } from 'react';
import UserMenu from '../components/user_menu';
import Main from '../layouts/main';
import GroupList from '../components/group_list.jsx';

export default class Lobby extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { user, groups, loaded } = this.props;
    let content;
    if (loaded) {
      content = (
        <div>
          <UserMenu user={user}/>
          <GroupList groups={groups}/>
        </div>
      );
    }
    return <Main content={content}/>;
  }
}

Lobby.propTypes = {
  user: React.PropTypes.object,       // Current meteor user
  groups: React.PropTypes.array,      // All groups
  loaded: React.PropTypes.bool,
};
