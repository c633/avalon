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
    return (
      <div className="login_wrapper">
        <div className="animate form login_form">
          <section className="login_content">
            <form onSubmit={this.login}>
              <h1>Login</h1>
              <div className={errors.username ? 'avalon-error' : ''}>
                <span>{errors.username}</span>
                <input type="text" className="form-control" placeholder="Username" ref="username" name="username" required=""/>
              </div>
              <div className={errors.password ? 'avalon-error' : ''}>
                <span>{errors.password}</span>
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
    if (Object.keys(errors).length) {
      this.setState({ errors });
      return;
    }
    Meteor.loginWithPassword(username, password, err => {
      if (err) {
        const errors = {};
        if (err.reason.toLowerCase().indexOf('user') > -1) {
          errors.username = err.reason;
        }
        if (err.reason.toLowerCase().indexOf('password') > -1) {
          errors.password = err.reason;
        }
        this.setState({ errors: errors });
      } else {
        this.context.router.push('/');
      }
    });
  }
}

Login.contextTypes = {
  router: React.PropTypes.object,
};
