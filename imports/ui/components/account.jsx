import React, { Component } from 'react';
import { Accounts } from 'meteor/accounts-base';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

const PASSWORD_SENTINEL = '_';
 
export default class Account extends Component {
  constructor(props) {
    super(props);
    this.state = { errors: {} };
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  render() {
    return this.props.user
      ? this.renderLogout()
      : this.renderLogin();
  }

  renderLogin() {
    const style = {
      margin: 25,
    };
    const { errors } = this.state;
    return (
      <div style={style}>
        <form onSubmit={this.login}>
          <TextField hintText="User name" ref="username" name="username" errorText={errors['username'] ? 'User name required' : ''} style={style}/>
          <TextField hintText="Password (optional)" ref="password" name="password" errorText={errors['reason'] || ''} type="password" style={style}/>
          <RaisedButton primary={true} label="Login" type="submit" style={style}/>
        </form>
      </div>
    );
  }

  renderLogout() {
    const style = {
      margin: 25,
    };

    const { user } = this.props;
    const username = user.username;
    return (
      <div style={style}>
        {username}
        <RaisedButton secondary={true} onClick={this.logout} label="Logout" style={style}/>
      </div>
    );
  }

  login(event) {
    event.preventDefault();
    const username = event.target.username.value;
    const password = PASSWORD_SENTINEL + event.target.password.value;
    const errors = {};

    if (!username) {
      errors.username = 'User name required';
    }

    this.setState({ errors });
    if (Object.keys(errors).length) {
      return;
    }

    Accounts.createUser({ // Force create new user
      username: username,
      password: password,
    }, err => { // User is already created
      Meteor.loginWithPassword(username, password, err => { // Login
        if (err) {
          this.setState({
            errors: { reason: err.reason },
          });
        }
        this.context.router.push('/');
      });
    });
  }

  logout(event) {
    event.preventDefault();
    const { user } = this.props;
    Meteor.logout();
    Meteor.users.remove(user._id);
    this.context.router.push('/');
  }
}

Account.propTypes = {
  user: React.PropTypes.object
};

Account.contextTypes = {
  router: React.PropTypes.object,
};
