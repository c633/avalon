import React from 'react';
import Navbar from './navbar.jsx';

export default class App extends React.Component {


  // REGION: Component Specifications

  render() {
    const { user, loaded, children } = this.props;
    return loaded ? (
      <div>
        <Navbar user={user}/>
        <div className="container">
          {children}
        </div>
      </div>
    ) : null;
  }
}

App.propTypes = {
  user: React.PropTypes.object,
  loaded: React.PropTypes.bool,
};
