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
      $push: { playerIds: this.userId },
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
      throw new Meteor.Error('groups.leave.alreadyJoined', 'Already leaved this group.');
    }
    if (group.players().length == 1) { // The last player wants to leave this group
      Groups.remove(groupId);
    } else {
      Groups.update(groupId, {
        $pull: { playerIds: this.userId },
      });
    }
  },
});
