import { Meteor } from 'meteor/meteor';

// if the database is empty on server start, create some sample data.
Meteor.startup(() => {
  // code to run on server at startup
  if (Meteor.users.find().count() == 0) {
    Accounts.createUser({ username: 'player1', password: 'password', });
    Accounts.createUser({ username: 'player2', password: 'password', });
    Accounts.createUser({ username: 'player3', password: 'password', });
    Accounts.createUser({ username: 'player4', password: 'password', });
    Accounts.createUser({ username: 'player5', password: 'password', });
    Accounts.createUser({ username: 'player6', password: 'password', });
  }
});
