import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import UserPage from '../pages/user_page.jsx';

export default createContainer(({ params: { id } }) => {
  const loaded = Meteor.subscribe('users.findOne', id).ready();
  return {
    _user: Meteor.user(), // NOTE: Additional prop: make page automatically re-render even if user logged out
    user: Meteor.users.findOne(id),
    loaded: loaded,
  };
}, UserPage);
