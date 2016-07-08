import { Meteor } from 'meteor/meteor';
import { Groups } from '../groups.js';

Meteor.publish('groups.findAll', function() {
  return Groups.find({}, {
    fields: Groups.publicFieldsWhileFindAll,
  });
});

Meteor.publish('groups.findOne', function(id) {
  return Groups.find({ _id: id }, {
    fields: Groups.publicFieldsWhileFindOne,
  });
});
