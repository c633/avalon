import React from 'react';

export default class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
  }

  // REGION: Component Specifications

  render() {
    const { user } = this.props;
    return (
      <div className="top_nav">
        <div className="nav_menu">
          <nav className="" role="navigation">
            <div className="nav toggle">
              <a href="/"><img src="/images/avatar.png" className="avalon-logo" alt="Logo"/></a>
            </div>
            <ul className="nav navbar-nav navbar-right">
            {
              user ?
                <li className="">
                  <a href="javascript:;" className="user-profile dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                    <img src="/images/avatar.png" alt=""/>{user.username}
                  </a>
                  <ul className="dropdown-menu dropdown-usermenu pull-right">
                    <li><a onClick={this.logout}><i className="fa fa-sign-out pull-right"></i> Log Out</a></li>
                  </ul>
                </li> :
                [
                  <li key="signup"><a href="/signup"><i className="fa fa-user-plus"></i> Signup</a></li>,
                  <li key="login"><a href="/login"><i className="fa fa-sign-in"></i> Login</a></li>
                ]
            }
            </ul>
          </nav>
        </div>
      </div>
    );
  }

  // REGION: Handlers

  logout() {
    Meteor.logout();
    // this.context.router.push('/'); // Force redirect to lobby
  }
}

Navbar.propTypes = {
  user: React.PropTypes.object
};

Navbar.contextTypes = {
  router: React.PropTypes.object
};
