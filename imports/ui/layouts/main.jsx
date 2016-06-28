import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppCanvas from 'material-ui/internal/AppCanvas';

const Main = ({content}) => (
  <MuiThemeProvider muiTheme={getMuiTheme()}>
    <AppCanvas>
      <br/>
      {content}
    </AppCanvas>
  </MuiThemeProvider>
);

Main.propTypes = {
  content: React.PropTypes.element,
};

export default Main;
