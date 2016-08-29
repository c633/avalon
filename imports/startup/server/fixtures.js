import { Meteor } from 'meteor/meteor';
import { Groups } from '../../api/groups/groups.jsx';

Meteor.startup(() => {

  const usernames = [
    'Saitama', 'Genos', 'Fubuki', 'King', 'Bang', 'ChildEmperor', 'AtomicSamurai', 'DriveKnight', 'Sneck', 'Lily',
    'SonGoKu', 'Vegeta', 'Cell', 'Frieza', 'Buu', 'Bulma', 'SonGoHan', 'Trunks', 'SonGoTen', 'Yamcha',
    'Aventador', 'Centenario', 'Huracan', 'Zagato', 'Gallardo', 'Vorsteiner', 'Kahn', 'Egoista', 'Veneno', 'Murcielago'
  ];

  const groupNames = ['OnePunchMan', 'DragonBall', 'Lamborghini', 'Doraemon', 'SuicideSquad'];

  if (Meteor.users.find().count() == 0) {
    for (const i of Array(usernames.length).keys()) {
      Accounts.createUser({ username: usernames[i], password: 'password' });
    }
  }
  if (Groups.find().count() == 0) {
    let c = 0;
    let players = [];
    for (const i of Array(usernames.length).keys()) {
      const user = Meteor.users.findOne({ username: usernames[i] });
      const groupsCount = Groups.find().count();
      if (i + 1 < (groupsCount + 1) * (groupsCount + 2)) {
        players.push({ id: user._id, role: 'Undecided' });
      } else {
        Groups.update(Groups.insert({ ownerId: user._id, name: groupNames[c++] }), { $push: { players: { $each: players.reverse() } } });
        players = [];
      }
    }
  }
});
