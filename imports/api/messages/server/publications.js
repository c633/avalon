import { Meteor } from 'meteor/meteor';
import { Messages } from '../messages.js';
import { check } from 'meteor/check';

Meteor.publish('messages.findAll', () => Messages.find({}, { fields: Messages.publicFields.findAll, sort: { sentAt: 1 } }));
