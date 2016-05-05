import React, { Component } from 'react';
import { Link } from 'react-router';
import { Accounts } from 'meteor/accounts-base';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
 
export default class Account extends Component {
  constructor(props) {
    super(props);
    this.state = { errors: {} };
    this.logout = this.logout.bind(this);
  }

  render() {
    return this.props.user
      ? this.renderLogout()
      : this.renderLoginOrSignup();
  }

  renderLoginOrSignup() {
    const style = {
      margin: 25,
    };
    const { errors } = this.state;
    return (
      <div style={style}>
        <RaisedButton primary={true} containerElement={<Link to="/login"/>} linkButton={true} label="Login" style={style}/>
        <RaisedButton primary={true} containerElement={<Link to="/signup"/>} linkButton={true} label="Signup" style={style}/>
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

  logout(event) {
    event.preventDefault();
    const { user } = this.props;
    Meteor.logout();
  }
}

Account.propTypes = {
  user: React.PropTypes.object
};
