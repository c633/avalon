import { Meteor } from 'meteor/meteor';
import { Groups } from '../groups.js';

Meteor.publish('groups.public', function groupsPublic() {
  return Groups.find({}, {
    fields: Groups.publicFields,
  });
});
