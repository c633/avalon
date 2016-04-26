import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.users.allow({
  remove: function() {
    return true
  },
});
