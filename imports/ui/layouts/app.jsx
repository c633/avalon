import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppCanvas from 'material-ui/internal/AppCanvas';
import AppBar from 'material-ui/AppBar';
import Account from '../components/account';

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  logout() {
    Meteor.logout();
  }

  render() {
    const { user } = this.props;
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <AppCanvas>
          <AppBar title="Avalon"/>
          <br/>
          <Account user={user}/>
        </AppCanvas>
      </MuiThemeProvider>
    );
  }
}

App.propTypes = {
  user: React.PropTypes.object,      // current meteor user
};

App.contextTypes = {
  router: React.PropTypes.object,
};
