import { Meteor } from 'meteor/meteor';
import { Groups } from '../../api/groups/groups.js';
import { createContainer } from 'meteor/react-meteor-data';
import App from '../layouts/app.jsx';

export default createContainer(() => {
  const loaded = !Meteor.userId() || Meteor.subscribe('users.findOne', Meteor.userId()).ready();
  return {
    user: Meteor.user(),
    loaded: loaded,
  };
}, App);
