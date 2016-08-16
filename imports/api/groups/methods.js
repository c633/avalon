import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Groups } from './groups.js';
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
      $push: { players: { id: this.userId, role: 0 } },
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
    additionalRoles: { type: [Number] },
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
      const playersCount = group.players.length;
      const evilPlayersCount = group.getEvilPlayersCount();
      let roles = additionalRoles;
      roles = roles.concat([Groups.Roles.MERLIN, Groups.Roles.ASSASSIN]); // Required players
      const servants = Array.from(Array(playersCount - evilPlayersCount - roles.filter(r => r > 0).length)).map(_ => Groups.Roles.SERVANT);
      const minions = Array.from(Array(evilPlayersCount - roles.filter(r => r < 0).length)).map(_ => Groups.Roles.MINION);
      _.shuffle(roles.concat(servants, minions)).forEach((r, i) => group.players[i].role = r);
      Groups.update(groupId, {
        $set: { players: group.players }
      });
      group = Groups.findOne(groupId); // Update local variable
      group.startNewMission();
    } else {
      Groups.update(groupId, {
        $set: { players: group.players.map(player => ({ id: player.id, role: Groups.Roles.UNDECIDED })), messages: [] },
        $unset: { guessMerlin: true }
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
    group.startWaitingForApproval();
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
    if (group.isDenied()) {
      group.startSelectingMembers();
    } else if (!group.isWaitingForApproval()) {
      group.startWaitingForVote();
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
      $set: { [`missions.${group.missions.length - 1}.teams.${group.missions[group.missions.length - 1].teams.length - 1}.successVotes.${group.getLastTeam().memberIndices.indexOf(group.players.map(p => p.id).indexOf(this.userId))}`]: success }
    });
    group = Groups.findOne(groupId); // Update local variable
    if (!group.isWaitingForVote()) {
      group.startNewMission();
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
      $set: { guessMerlin: group.players[merlinIndex].role == Groups.Roles.MERLIN }
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
