import { Meteor } from 'meteor/meteor';
import { Groups } from '../groups.js';

Meteor.publish('groups.findAll', function() {
  return Groups.find({}, {
    fields: Groups.publicFields,
  });
});

Meteor.publish('groups.find', function(id) {
  return Groups.find({ _id: id }, {
    fields: Groups.publicFields,
  });
});
