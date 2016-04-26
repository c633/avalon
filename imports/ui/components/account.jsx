import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
 
export default class Account extends Component {
  render() {
    return this.props.user
      ? this.renderLogout()
      : this.renderLogin();
  }

  renderLogin() {
    const style = {
      margin: 25,
    };
    return (
      <div style={style}>
        <TextField hintText="User name" style={style}/>
        <TextField hintText="Password (optional)" type="password" style={style}/>
        <RaisedButton primary={true} label="Login" style={style}/>
      </div>
    );
  }

  renderLogout() {
    const style = {
      margin: 25,
    };

    const { user } = this.props;
    const userName = user.username;
    return (
      <div style={style}>
        {userName}
        <RaisedButton secondary={true} label="Logout" style={style}/>
      </div>
    );
  }
}

Account.propTypes = {
  user: React.PropTypes.object
};
