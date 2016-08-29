import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

Meteor.publish('users.findAll', () => Meteor.users.find({}, { fields: { username: 1, brief: 1 } }));
Meteor.publish('users.findOne', id => {
  check(id, String);
  return Meteor.users.find({ _id: id }, { fields: { username: 1, brief: 1, activities: 1 } });
});
Meteor.publish('users.findOneByUsername', username => {
  check(username, String);
  return Meteor.users.find({ username: username }, { fields: { username: 1, brief: 1, activities: 1 } });
});
