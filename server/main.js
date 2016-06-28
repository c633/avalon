import { Meteor } from 'meteor/meteor';
import '/imports/startup/server';

Meteor.users.allow({
  remove: function() {
    return true
  },
});
