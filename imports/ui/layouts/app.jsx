import React from 'react';
import Navbar from './navbar';
import Footer from './footer';

export default class App extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { user, children } = this.props;
    return (
      <div>
        <Navbar user={user}/>
        <div className="container">
          {children}
        </div>
        <Footer/>
      </div>
    );
  }
}

App.propTypes = {
  user: React.PropTypes.object,
  children: React.PropTypes.element,
};
