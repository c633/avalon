import { Meteor } from 'meteor/meteor';
import { Groups } from '../../api/groups/groups.js';

// If the database is empty on server start, create some sample data.
Meteor.startup(() => {
  // Code to run on server at startup
  if (Meteor.users.find().count() == 0) {
    for (let i of Array(15).keys()) {
      Accounts.createUser({ username: `player${i + 1}`, password: 'password', });
    }
  }
  if (Groups.find().count() == 0) {
    let j = 1;
    for (let i of Array(5).keys()) {
      const user = Meteor.users.findOne({ username: `player${i + 1}` });
      Groups.insert({ ownerId: user._id, name: `group${j++}` });
      Groups.insert({ ownerId: user._id, name: `group${j++}` });
    }
  }
});
