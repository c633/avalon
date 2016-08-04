import { Meteor } from 'meteor/meteor';

Meteor.publish('users.findAll', function() {
  return Meteor.users.find({}, { fields: { username: 1 } });
});

Meteor.publish('users.findOne', function(id) {
  return Meteor.users.find({ _id: id }, { fields: { username: 1, activities: 1 } });
});
