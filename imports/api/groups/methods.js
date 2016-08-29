import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Groups } from './groups.jsx';
import { _ } from 'meteor/underscore';

export const insert = new ValidatedMethod({
  name: 'groups.insert',
  validate: new SimpleSchema({
    name: { type: String },
  }).validator(),
  run({ name }) {
    const group = {
      ownerId: this.userId,
      name: name,
      guessMerlin: undefined,
    };
    return Groups.insert(group);
  },
});

export const join = new ValidatedMethod({
  name: 'groups.join',
  validate: new SimpleSchema({
    groupId: { type: String },
  }).validator(),
  run({ groupId }) {
    if (!this.userId) {
      throw new Meteor.Error('groups.join.notLoggedIn', 'Must be logged in to join groups.');
    }
    const group = Groups.findOne(groupId);
    if (group.hasPlayer(this.userId)) {
      throw new Meteor.Error('groups.join.alreadyJoined', 'Already joined this group.');
    }
    Groups.update(groupId, {
      $push: { players: { id: this.userId, role: 'Undecided' } },
    });
  },
});

export const leave = new ValidatedMethod({
  name: 'groups.leave',
  validate: new SimpleSchema({
    groupId: { type: String },
  }).validator(),
  run({ groupId }) {
    if (!this.userId) {
      throw new Meteor.Error('groups.leave.notLoggedIn', 'Must be logged in to leave groups.');
    }
    const group = Groups.findOne(groupId);
    if (!group.hasPlayer(this.userId)) {
      throw new Meteor.Error('groups.leave.alreadyLeaved', 'Already leaved this group.');
    }
    if (group.players.length == 1) { // The last player wants to leave this group
      Groups.remove(groupId);
    } else {
      Groups.update(groupId, {
        $pull: { players: { id: this.userId } },
      });
    }
  },
});

export const start = new ValidatedMethod({
  name: 'groups.start',
  validate: new SimpleSchema({
    groupId: { type: String },
    reset: { type: Boolean },
    additionalRoles: { type: [String] },
  }).validator(),
  run({ groupId, additionalRoles, reset }) {
    let group = Groups.findOne(groupId);
    if (!group.hasOwner(this.userId)) {
      throw new Meteor.Error('groups.start.accessDenied', 'Don\'t have permission to start playing.');
    }
    Groups.update(groupId, {
      $set: { missions: [] },
    });
    if (!reset) {
      if (!group.checkSelectedAdditionalRolesValidation(additionalRoles)) {
        throw new Meteor.Error('groups.start.invalidAdditionalRoles', 'Invalid selected additional roles.');
      }
      const players = group.players;
      const playersCount = players.length;
      const evilPlayersCount = group.getEvilPlayersCount();
      const roles = additionalRoles.concat(['Merlin', 'Assassin']); // Required players
      const servants = Array.from(new Array(playersCount - evilPlayersCount - roles.filter(r => Groups.ROLES[r].side).length)).map(() => 'Servant');
      const minions = Array.from(new Array(evilPlayersCount - roles.filter(r => !Groups.ROLES[r].side).length)).map(() => 'Minion');
      _.shuffle(roles.concat(servants, minions)).forEach((r, i) => players[i].role = r);
      Groups.update(groupId, {
        $set: { players: players, firstLeaderIndex: Math.floor(Math.random() * playersCount) }
      });
      group = Groups.findOne(groupId); // Update local variable
      beginNewMission(group);
    } else {
      Groups.update(groupId, {
        $set: { players: group.players.map(player => ({ id: player.id, role: 'Undecided' })), firstLeaderIndex: 0, messages: [] },
        $unset: { guessMerlin: 1 }
      });
    }
  },
});

export const selectMembers = new ValidatedMethod({
  name: 'groups.selectMembers',
  validate: new SimpleSchema({
    groupId: { type: String },
    memberIndices: { type: [Number] },
  }).validator(),
  run({ groupId, memberIndices }) {
    let group = Groups.findOne(groupId);
    if (!group.checkSelectedMembersValidation(memberIndices)) {
      throw new Meteor.Error('groups.selectMembers.invalid', 'Invalid selected mission team members.');
    }
    Groups.update(groupId, {
      $set: { [`missions.${group.missions.length - 1}.teams.${group.missions[group.missions.length - 1].teams.length - 1}.memberIndices`]: memberIndices }
    });
    group = Groups.findOne(groupId); // Update local variable
    beginWaitingForApproval(group);
  },
});

export const approve = new ValidatedMethod({
  name: 'groups.approve',
  validate: new SimpleSchema({
    groupId: { type: String },
    approval: { type: Boolean },
  }).validator(),
  run({ groupId, approval }) {
    let group = Groups.findOne(groupId);
    Groups.update(groupId, {
      $set: { [`missions.${group.missions.length - 1}.teams.${group.missions[group.missions.length - 1].teams.length - 1}.approvals.${group.players.map(p => p.id).indexOf(this.userId)}`]: approval }
    });
    group = Groups.findOne(groupId); // Update local variable
    if (group.getLastTeamsCount() < Groups.MISSION_TEAMS_COUNT && group.isDenied()) { // Hammer
      beginSelectingMembers(group);
    } else if (!group.isWaitingForApproval()) {
      beginWaitingForVote(group);
    }
  },
});

export const vote = new ValidatedMethod({
  name: 'groups.vote',
  validate: new SimpleSchema({
    groupId: { type: String },
    success: { type: Boolean },
  }).validator(),
  run({ groupId, success }) {
    let group = Groups.findOne(groupId);
    Groups.update(groupId, {
      $set: { [`missions.${group.missions.length - 1}.votes.${group.getLastTeam().memberIndices.indexOf(group.players.map(p => p.id).indexOf(this.userId))}`]: success }
    });
    group = Groups.findOne(groupId); // Update local variable
    if (!group.isWaitingForVote()) {
      beginNewMission(group);
    }
  },
});

export const guess = new ValidatedMethod({
  name: 'groups.guess',
  validate: new SimpleSchema({
    groupId: { type: String },
    merlinIndex: { type: Number },
  }).validator(),
  run({ groupId, merlinIndex }) {
    let group = Groups.findOne(groupId);
    Groups.update(groupId, {
      $set: { guessMerlin: group.players[merlinIndex].role == 'Merlin' }
    });
    group = Groups.findOne(groupId); // Update local variable
    group.finish();
  },
});

export const sendMessage = new ValidatedMethod({
  name: 'groups.sendMessage',
  validate: new SimpleSchema({
    groupId: { type: String },
    text: { type: String },
  }).validator(),
  run({ groupId, text }) {
    if (text.length > 0) {
      const group = Groups.findOne(groupId);
      Groups.update(groupId, {
        $push: {
          messages: {
            senderId: this.userId,
            text: text,
            sentAt: new Date(),
          }
        }
      });
    }
  },
});

// REGION: Helpers

const beginNewMission = (group) => {
  const summaryResults = group.getSummaries().map(m => m[m.length - 1].result);
  if (summaryResults.filter(m => !m).length >= Groups.MISSIONS_COUNT_TO_WIN) {
    finish(group);
    return;
  } else if (summaryResults.filter(m => m).length >= Groups.MISSIONS_COUNT_TO_WIN) {
    beginGuessingMerlin(group);
    return;
  }
  const newMission = { teams: [], votes: [] };
  Groups.update(group._id, {
    $push: { missions: newMission }
  });
  group.missions.push(newMission); // Update local variable
  beginSelectingMembers(group);
}

const beginSelectingMembers = (group) => {
  if (group.getLastTeamsCount() >= Groups.MISSION_TEAMS_COUNT) {
    finish(group);
    return;
  }
  // const memberIndices = _.shuffle(Array.from(new Array(group.players.length), (_, i) => i)).slice(0, Groups.MISSIONS_MEMBERS_COUNT[group.players.length][group.missions.length - 1]); // TEST
  const memberIndices = [];
  Groups.update(group._id, {
    $push: { [`missions.${group.missions.length - 1}.teams`]: { memberIndices: memberIndices, approvals: [] } }
  });
  // FIXME: Remove redundancy (@ref 'methods' `selectedMembers`)
  group.getLastMission().teams.push({ memberIndices: memberIndices, approvals: [] }); // Update local variable
  if (!group.isSelectingMembers()) {
    beginWaitingForApproval(group);
  }
}

const beginWaitingForApproval = (group) => {
  // const approvals = Array.from(new Array(group.players.length), () => Math.random() > 0.5 ? true : false); // TEST
  const approvals = Array.from(new Array(group.players.length), () => null);
  Groups.update(group._id, {
    $set: { [`missions.${group.missions.length - 1}.teams.${group.getLastTeamsCount() - 1}.approvals`]: approvals }
  });
  // FIXME: Remove redundancy (@ref 'methods' `approve`)
  group.getLastTeam().approvals = approvals; // Update local variable
  if (group.getLastTeamsCount() < Groups.MISSION_TEAMS_COUNT && group.isDenied()) { // Hammer
    beginSelectingMembers(group);
  } else if (!group.isWaitingForApproval()) {
    beginWaitingForVote(group);
  }
}

const beginWaitingForVote = (group) => {
  const lastMission = group.getLastMission();
  // const votes = Array.from(new Array(Groups.MISSIONS_MEMBERS_COUNT[group.players.length][group.missions.length - 1]), (_, i) => Groups.ROLES[group.players[lastMission.teams[lastMission.teams.length - 1].memberIndices[i]].role].side ? true : Math.random() > 0.3 ? true : false); // TEST
  const votes = Array.from(new Array(Groups.MISSIONS_MEMBERS_COUNT[group.players.length][group.missions.length - 1]), (_, i) => Groups.ROLES[group.players[lastMission.teams[lastMission.teams.length - 1].memberIndices[i]].role].side ? null : null);
  Groups.update(group._id, {
    $set: { [`missions.${group.missions.length - 1}.votes`]: votes }
  });
  // FIXME: Remove redundancy (@ref 'methods' `vote`)
  group.getLastMission().votes = votes; // Update local variable
  if (!group.isWaitingForVote()) {
    beginNewMission(group);
  }
}

const beginGuessingMerlin = (group) => {
  // const guessMerlin = Math.random() > 0.5 ? true : false; // TEST
  const guessMerlin = null;
  Groups.update(group._id, {
    $set: { guessMerlin: guessMerlin }
  });
  // FIXME: Remove redundancy (@ref 'methods' `guess`)
  group.guessMerlin = guessMerlin; //Update local variable
  if (group.guessMerlin != null) {
    finish(group);
  }
}

const finish = (group) => {
  const playerActivities = [];
  const result = group.getSituation().result;
  for (const p of group.players) {
    playerActivities.push({ id: p.id, activity: { finishedAt: new Date(), role: p.role, result: Groups.ROLES[p.role].side ? result : !result, deniedTeamsCount: 0, successTeamsCount: 0, failTeamsCount: 0 } });
  };
  for (const m of group.getSummaries()) {
    for (const t of m) {
      for (const i of t.memberIndices) {
        if (t.result == null) {
          playerActivities[i].activity.deniedTeamsCount++;
        } else if (t.result) {
          playerActivities[i].activity.successTeamsCount++;
        } else {
          playerActivities[i].activity.failTeamsCount++;
        }
      }
    };
  };
  for (const p of playerActivities) {
    Meteor.users.update(p.id, {
      $push: { activities: p.activity }
    });
  }
}
