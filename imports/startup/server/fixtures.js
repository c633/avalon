import { Meteor } from 'meteor/meteor';
import { Groups } from '../../api/groups/groups.js';

// If the database is empty on server start, create some sample data.
Meteor.startup(() => {
  // Code to run on server at startup
  if (Meteor.users.find().count() == 0) {
    Accounts.createUser({ username: 'player1', password: 'password', });
    Accounts.createUser({ username: 'player2', password: 'password', });
    Accounts.createUser({ username: 'player3', password: 'password', });
    Accounts.createUser({ username: 'player4', password: 'password', });
    Accounts.createUser({ username: 'player5', password: 'password', });
    Accounts.createUser({ username: 'player6', password: 'password', });
  }
  if (Groups.find().count() == 0) {
    const user1 = Meteor.users.findOne({ username: 'player1' });
    const user2 = Meteor.users.findOne({ username: 'player2' });
    Groups.insert({ ownerId: user1._id, name: 'group1' });
    Groups.insert({ ownerId: user1._id, name: 'group2' });
    Groups.insert({ ownerId: user2._id, name: 'group3' });
    Groups.insert({ ownerId: user2._id, name: 'group4' });
  }
});
