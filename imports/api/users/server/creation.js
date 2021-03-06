import { Groups } from '../../groups/groups.jsx';

// Users.brief schema
// {
//   avatarVersion: Number
// }

// Users.activities schema
// [
//   {
//     finishedAt: Date,
//     role: String,
//     result: Boolean,               // `true` is Win, `false` is Lose
//     deniedTeamsCount: Number,
//     successTeamsCount: Number,
//     failTeamsCount: Number,
//   }
// ]

Accounts.onCreateUser((_, user) => {
  user.brief = { avatarVersion: undefined };
  user.activities = [];
  return user;
});
