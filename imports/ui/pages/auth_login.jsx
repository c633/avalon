import React, { Component } from 'react';
import { Link } from 'react-router';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import Main from '../layouts/main';
 
export default class AuthLogin extends Component {
  constructor(props) {
    super(props);
    this.state = { errors: {} };
    this.login = this.login.bind(this);
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
        <form onSubmit={this.login}>
          <TextField hintText="User name" ref="username" name="username" errorText={usernameError} style={style}/>
          <TextField hintText="Password" ref="password" name="password" errorText={passwordError} type="password" style={style}/>
          <RaisedButton primary={true} label="Login" type="submit" style={style}/>
        </form>
        <RaisedButton primary={true} containerElement={<Link to="/signup"/>} linkButton={true} label="Signup" style={style}/>
        <RaisedButton primary={true} containerElement={<Link to="/"/>} linkButton={true} label="Home" style={style}/>
      </div>
    );
    return <Main content={content}/>;
  }

  login(event) {
    event.preventDefault();
    const username = this.refs.username.getValue();
    const password = this.refs.password.getValue();
    const errors = {};

    if (!username) {
      errors.username = 'User name required';
    }

    if (!password) {
      errors.password = 'Password required';
    }

    this.setState({ errors });
    if (Object.keys(errors).length) {
      return;
    }

    Meteor.loginWithPassword(username, password, err => {
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

AuthLogin.contextTypes = {
  router: React.PropTypes.object,
};
