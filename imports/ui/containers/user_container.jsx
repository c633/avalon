import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import UserPage from '../pages/user_page.jsx';

export default createContainer(({ params: { username } }) => {
  const loaded = Meteor.subscribe('users.findOneByUsername', username).ready();
  return {
    _user: Meteor.user(), // NOTE: Additional prop: make page automatically re-render even if user logged out
    user: Meteor.users.findOne({ username: username }),
    loaded: loaded,
  };
}, UserPage);
