import React, { Component } from 'react';
import UserMenu from '../components/user_menu';
import Main from '../layouts/main';

export default class Lobby extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { user } = this.props;
    const content = (
      <UserMenu user={user}/>
    );
    return <Main content={content}/>;
  }
}

Lobby.propTypes = {
  user: React.PropTypes.object,      // current meteor user
};
