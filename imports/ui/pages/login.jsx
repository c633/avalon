import React from 'react';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = { errors: {} };
    this.login = this.login.bind(this);
  }

  // REGION: Component Specifications

  render() {
    const { errors } = this.state;
    let usernameError = (errors['username'] || errors['reason']);
    let passwordError = (errors['password'] || errors['reason']);
    usernameError = usernameError && (usernameError.toLowerCase().indexOf('user') > -1 ? usernameError : '');
    passwordError = passwordError && (passwordError.toLowerCase().indexOf('password') > -1 ? passwordError : '');
    return (
      <div className="login_wrapper">
        <div className="animate form login_form">
          <section className="login_content">
            <form onSubmit={this.login}>
              <h1>Login</h1>
              <div className={usernameError ? 'avalon-error' : ''}>
                <span>{usernameError}</span>
                <input type="text" className="form-control" placeholder="Username" ref="username" name="username" required=""/>
              </div>
              <div className={passwordError ? 'avalon-error' : ''}>
                <span>{passwordError}</span>
                <input type="password" className="form-control" placeholder="Password" ref="password" name="password" required=""/>
              </div>
              <div>
                <button type="submit" className="btn btn-info submit">Login</button>
              </div>
              <div className="clearfix"></div>
              <div className="separator">
                <p className="change_link">New to site?
                  <a href="/signup" className="to_register"> Create Account </a>
                </p>
                <div className="clearfix"></div>
                <br/>
                <div>
                  <h1><i className="fa fa-paw"></i> Avalon game</h1>
                  <p>©2016 All Rights Reserved.</p>
                </div>
              </div>
            </form>
          </section>
        </div>
      </div>
    );
  }

  // REGION: Handlers

  login(event) {
    event.preventDefault();
    const username = this.refs.username.value;
    const password = this.refs.password.value;
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

Login.contextTypes = {
  router: React.PropTypes.object,
};
