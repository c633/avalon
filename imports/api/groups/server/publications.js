import { Meteor } from 'meteor/meteor';
import { Groups } from '../groups.js';
import { check } from 'meteor/check';

Meteor.publish('groups.findAll', () => Groups.find({}, { fields: Groups.publicFieldsWhenFindAll }));
Meteor.publish('groups.findOne', id => {
  check(id, String);
  return Groups.find({ _id: id }, { fields: Groups.publicFieldsWhenFindOne });
});
