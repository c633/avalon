import React from 'react';

export default class AuthSignup extends React.Component {
  constructor(props) {
    super(props);
    this.state = { errors: {} };
    this.signup = this.signup.bind(this);
  }

  // REGION: Component Specifications

  render() {
    const { errors } = this.state;
    let usernameError = errors['username'] || errors['reason'];
    let passwordError = errors['password'] || errors['reason'];
    usernameError = usernameError && (usernameError.toLowerCase().indexOf('user') > -1 ? usernameError : '');
    passwordError = passwordError && (passwordError.toLowerCase().indexOf('password') > -1 ? passwordError : '');
    return (
      <div className="login_wrapper">
        <div className="animate form login_form">
          <section className="login_content">
            <form onSubmit={this.signup}>
              <h1>Signup</h1>
              <div className={usernameError ? 'avalon-error' : ''}>
                <span>{usernameError}</span>
                <input type="text" className="form-control" placeholder="Username" ref="username" name="username" required=""/>
              </div>
              <div className={passwordError ? 'avalon-error' : ''}>
                <span>{passwordError}</span>
                <input type="password" className="form-control" placeholder="Password" ref="password" name="password" required=""/>
              </div>
              <div>
                <button type="submit" className="btn btn-default submit">Signup</button>
              </div>
              <div className="clearfix"></div>
              <div className="separator">
                <p className="change_link">Already has an account?
                  <a href="/login" className="to_register"> Login here </a>
                </p>
                <div className="clearfix"></div>
                <br />
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

  signup(event) {
    event.preventDefault();
    const username = this.refs.username.value;
    const password = this.refs.password.value;
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
