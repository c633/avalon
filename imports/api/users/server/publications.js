import { Meteor } from 'meteor/meteor';

Meteor.publish('users.findAll', () => Meteor.users.find({}, { fields: { username: 1 } }));
Meteor.publish('users.findOne', id => Meteor.users.find({ _id: id }, { fields: { username: 1, activities: 1 } }));
