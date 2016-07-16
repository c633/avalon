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
      $set: { missions: reset ? [] : [{ leaderId: this.userId, memberIndices: [], approvals: [], failVotes: [] }] },
    });
    if (!reset) {
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
    if (!group.lastMissionMembersIsValid(selectedMemberIndices)) {
      throw new Meteor.Error('groups.selectMembers.invalid', 'Invalid selected mission team members.');
    }
    group.missions[group.missions.length - 1].memberIndices = selectedMemberIndices;
    Groups.update(groupId, {
      $set: { missions: group.missions } // TODO: Properly set last mission selected members
    });
  },
});
