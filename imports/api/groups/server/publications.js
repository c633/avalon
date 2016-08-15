import { Meteor } from 'meteor/meteor';
import { Groups } from '../groups.js';

Meteor.publish('groups.findAll', () => Groups.find({}, { fields: Groups.publicFieldsWhenFindAll }));
Meteor.publish('groups.findOne', id => Groups.find({ _id: id }, { fields: Groups.publicFieldsWhenFindOne }));
