import React, { Component } from 'react';
import { Link } from 'react-router';
import { Accounts } from 'meteor/accounts-base';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Main from '../layouts/main';
 
export default class AuthSignup extends Component {
  constructor(props) {
    super(props);
    this.state = { errors: {} };
    this.signup = this.signup.bind(this);
  }

  render() {
    const style = {
      margin: 25,
    };
    const { errors } = this.state;
    var usernameError = (errors['username'] || errors['reason']);
    var passwordError = (errors['password'] || errors['reason']);
    usernameError = usernameError && (usernameError.toLowerCase().indexOf('user') > -1 ? usernameError : '');
    passwordError = passwordError && (passwordError.toLowerCase().indexOf('password') > -1 ? passwordError : '');
    const content = (
      <div style={style}>
        <form onSubmit={this.signup}>
          <TextField hintText="User name" ref="username" name="username" errorText={usernameError} style={style}/>
          <TextField hintText="Password" ref="password" name="password" errorText={passwordError} type="password" style={style}/>
          <RaisedButton primary={true} label="Signup" type="submit" style={style}/>
        </form>
        <RaisedButton primary={true} containerElement={<Link to="/login"/>} linkButton={true} label="Login" style={style}/>
        <RaisedButton primary={true} containerElement={<Link to="/"/>} linkButton={true} label="Home" style={style}/>
      </div>
    );
    return <Main content={content}/>;
  }

  signup(event) {
    event.preventDefault();
    const username = this.refs.username.getValue();
    const password = this.refs.password.getValue();
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
    }, err => {
      if (err) {
        this.setState({
          errors: { reason: err.reason },
        }); 
      } else {
        this.context.router.push('/'); 
      }
    });
  }
}

AuthSignup.contextTypes = {
  router: React.PropTypes.object,
};
