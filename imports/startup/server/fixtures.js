import { Meteor } from 'meteor/meteor';
import { Groups } from '../../api/groups/groups.jsx';

// If the database is empty on server start, create some sample data.
Meteor.startup(() => {
  // Code to run on server at startup
  if (Meteor.users.find().count() == 0) {
    for (const i of Array(30).keys()) {
      Accounts.createUser({ username: `player${i + 1}`, password: 'password' });
    }
  }
  if (Groups.find().count() == 0) {
    let c = 1;
    let players = [];
    for (const i of Array(30).keys()) {
      const user = Meteor.users.findOne({ username: `player${i + 1}` });
      const groupsCount = Groups.find().count();
      if (i + 1 < (groupsCount + 1) * (groupsCount + 2)) {
        players.push({ id: user._id, role: 'Undecided' });
      } else {
        Groups.update(Groups.insert({ ownerId: user._id, name: `group${c++}` }), { $push: { players: { $each: players.reverse() } } });
        players = [];
      }
    }
  }
});
