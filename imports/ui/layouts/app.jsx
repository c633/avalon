import React from 'react';
import Navbar from './navbar';
import Footer from './footer';

const App = ({user, content}) => (
  <div>
    <Navbar user={user}/>
    <div className="container">
      {content}
    </div>
    <Footer/>
  </div>
);

App.propTypes = {
  content: React.PropTypes.element,
};

export default App;
