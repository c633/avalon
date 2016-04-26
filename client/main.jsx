import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
 
import AccountLogin from './components/account_login.jsx';

Meteor.startup(() => {
  render(<AccountLogin />, document.getElementById('account-login'));
});
