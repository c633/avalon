import React, { Component } from 'react';
import Account from '../components/account';
import Main from '../layouts/main';

export default class Lobby extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { user } = this.props;
    const content = (
      <Account user={user}/>
    );
    return <Main content={content}/>;
  }
}

Lobby.propTypes = {
  user: React.PropTypes.object,      // current meteor user
};
