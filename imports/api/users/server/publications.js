import { Meteor } from 'meteor/meteor';

Meteor.publish('users.find', function(id) {
  return Meteor.users.find({ _id: id }, { fields: { username: 1 } });
});
