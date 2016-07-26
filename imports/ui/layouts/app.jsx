import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppCanvas from 'material-ui/internal/AppCanvas';
import Navbar from './navbar';
import Footer from './footer';

const App = ({content}) => (
  <div>
    <Navbar user={Meteor.user()}/>
    <div className="right_col" role="main">
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <AppCanvas>
          <br/>
          {content}
        </AppCanvas>
      </MuiThemeProvider>
    </div>
    <Footer/>
  </div>
);

App.propTypes = {
  content: React.PropTypes.element,
};

export default App;
