import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Groups } from './groups.js';

export const insert = new ValidatedMethod({
  name: 'groups.insert',
  validate: new SimpleSchema({
    name: { type: String },
  }).validator(),
  run({ name }) {
    const group = {
      ownerId: this.userId,
      name: name,
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
      $push: { players: { id: this.userId, isSpy: false } },
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
    if (group.getPlayers().length == 1) { // The last player wants to leave this group
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
  }).validator(),
  run({ groupId, reset }) {
    const group = Groups.findOne(groupId);
    if (!group.belongsTo(this.userId)) {
      throw new Meteor.Error('groups.start.accessDenied', 'Don\'t have permission to start playing.');
    }
    Groups.update(groupId, {
      $set: { missions: [] },
    });
    if (!reset) {
      group.startNewMission();
      const playersCount = group.players.length;
      let indices = Array.from(new Array(playersCount), (_, i) => i);
      for (let _ of Array(Math.round(playersCount / 3)).keys()) {
        group.players[indices.splice(Math.floor(Math.random() * indices.length), 1)[0]].isSpy = true;
      }
      Groups.update(groupId, {
        $set: { players: group.players }
      });
    } else {
      Groups.update(groupId, {
        $set: { players: group.players.map(player => ({ id: player.id, isSpy: false })) }
      });
    }
  },
});

export const selectMembers = new ValidatedMethod({
  name: 'groups.selectMembers',
  validate: new SimpleSchema({
    groupId: { type: String },
    selectedMemberIndices: { type: [Number] },
  }).validator(),
  run({ groupId, selectedMemberIndices }) {
    const group = Groups.findOne(groupId);
    if (!group.isSelectedMembersValid(selectedMemberIndices)) {
      throw new Meteor.Error('groups.selectMembers.invalid', 'Invalid selected mission team members.');
    }
    const lastTeamMemberIndices = {};
    lastTeamMemberIndices[`missions.${group.missions.length - 1}.teams.${group.missions[group.missions.length - 1].teams.length - 1}.memberIndices`] = selectedMemberIndices;
    Groups.update(groupId, {
      $set: lastTeamMemberIndices
    });
    group.startWaitingForApproval();
  },
});

export const approve = new ValidatedMethod({
  name: 'groups.approve',
  validate: new SimpleSchema({
    groupId: { type: String },
    userId: { type: String },
    approval: { type: Boolean },
  }).validator(),
  run({ groupId, userId, approval }) {
    let group = Groups.findOne(groupId);
    const lastTeamApproval = {};
    lastTeamApproval[`missions.${group.missions.length - 1}.teams.${group.missions[group.missions.length - 1].teams.length - 1}.approvals.${group.players.map(p => p.id).indexOf(userId)}`] = approval;
    Groups.update(groupId, {
      $set: lastTeamApproval
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
    userId: { type: String },
    success: { type: Boolean },
  }).validator(),
  run({ groupId, userId, success }) {
    let group = Groups.findOne(groupId);
    const lastTeamSuccessVote = {};
    lastTeamSuccessVote[`missions.${group.missions.length - 1}.teams.${group.missions[group.missions.length - 1].teams.length - 1}.successVotes.${group.getLastTeam().memberIndices.indexOf(group.players.map(p => p.id).indexOf(userId))}`] = success;
    Groups.update(groupId, {
      $set: lastTeamSuccessVote
    });
    group = Groups.findOne(groupId); // Update local variable
    if (!group.isWaitingForVote()) {
      group.startNewMission();
    }
  },
});
