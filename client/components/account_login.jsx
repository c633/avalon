import React, { Component } from 'react';
import AppCanvas from 'material-ui/internal/AppCanvas';
import AppBar from 'material-ui/AppBar';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
 
export default class AccountLogin extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <AppCanvas>
          <AppBar title="Avalon"/>
          <div style={{padding: '80px'}}>
            <br/>
            <TextField hintText="User name"/>
            <br/>
            <br/>
            <TextField hintText="Password (optional)" type="password"/>
            <br/>
            <br/>
            <RaisedButton primary={true} label="Login"/>
          </div>
        </AppCanvas>
      </MuiThemeProvider>
    );
  }
}
