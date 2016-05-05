import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppCanvas from 'material-ui/internal/AppCanvas';
import AppBar from 'material-ui/AppBar';

const Main = ({content}) => (
  <MuiThemeProvider muiTheme={getMuiTheme()}>
    <AppCanvas>
      <AppBar title="Avalon"/>
      <br/>
      {content}
    </AppCanvas>
  </MuiThemeProvider>
);

Main.propTypes = {
  content: React.PropTypes.element,
};

export default Main;
