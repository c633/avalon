import { Groups } from '../../groups/groups.js';

// Users.activities schema
// [
//   {
//     finishedAt: Date,
//     role: Number,
//     result: Boolean,               // `true` is Win, `false` is Lose
//     deniedTeamsCount: Number,
//     successTeamsCount: Number,
//     failTeamsCount: Number,
//   }
// ]

Accounts.onCreateUser((_, user) => {
  user.activities = [];
  return user;
});
