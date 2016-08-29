import React from 'react';

export default class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = { errors: {} };
    this.signup = this.signup.bind(this);
  }

  // REGION: Component Specifications

  render() {
    const { errors } = this.state;
    return (
      <div className="login_wrapper">
        <div className="animate form login_form">
          <section className="login_content">
            <form onSubmit={this.signup}>
              <h1>Signup</h1>
              <div className={errors.username ? 'avalon-error' : ''}>
                <span>{errors.username}</span>
                <input type="text" className="form-control" placeholder="Username" ref="username" name="username" required=""/>
              </div>
              <div className={errors.password ? 'avalon-error' : ''}>
                <span>{errors.password}</span>
                <input type="password" className="form-control" placeholder="Password" ref="password" name="password" required=""/>
              </div>
              <div>
                <button type="submit" className="btn btn-dark submit">Signup</button>
              </div>
              <div className="clearfix"></div>
              <div className="separator">
                <p className="change_link">Already has an account?
                  <a href="/login" className="to_register"> Login here </a>
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

  signup(event) {
    event.preventDefault();
    const username = this.refs.username.value;
    const password = this.refs.password.value;
    const errors = {};
    if (!username.match(/^[a-zA-Z0-9_]+$/)) {
      errors.username = 'User name can use only letters (a-z), numbers, and underscores';
    }
    if (Object.keys(errors).length) {
      this.setState({ errors });
      return;
    }
    Accounts.createUser({ // Create new user
      username: username,
      password: password,
    }, err => {
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

Signup.contextTypes = {
  router: React.PropTypes.object,
};
