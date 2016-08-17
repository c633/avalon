import React from 'react';
import Navbar from './navbar.jsx';
import Footer from './footer.jsx';

export default class App extends React.Component {

  constructor(props) {
    super(props);
  }

  // REGION: Component Specifications

  render() {
    const { user, loaded, children } = this.props;
    return loaded ?
      <div>
        <Navbar user={user}/>
        <div className="container">
          {children}
        </div>
        <Footer/>
      </div> : null;
  }
}

App.propTypes = {
  user: React.PropTypes.object,
  loaded: React.PropTypes.bool,
  children: React.PropTypes.element,
};
