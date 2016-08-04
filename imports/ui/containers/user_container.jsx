import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import UserPage from '../pages/user_page.jsx';

export default createContainer(({ params: { id } }) => {
  const user = Meteor.users.findOne(id);
  const loaded = Meteor.subscribe('users.findOne', id).ready();
  return {
    user,
    loaded,
  };
}, UserPage);
