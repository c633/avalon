import { Meteor } from 'meteor/meteor';
import { Groups } from '../groups.jsx';
import { check } from 'meteor/check';

Meteor.publish('groups.findAll', (name, page) => {
  check(name, String);
  check(page, Number);
  const GROUPS_PER_PAGE = Groups.find().count();
  const skippedGroupsCount = (page - 1) * GROUPS_PER_PAGE;
  const selector = { name: { $regex: name } };
  if (skippedGroupsCount > 0) {
    const lastGroup = Groups.find(selector, { sort: { createdAt: -1 }, limit: skippedGroupsCount }).fetch().pop();
    selector.createdAt = { $lt: lastGroup.createdAt };
  }
  return Groups.find(selector, { fields: Groups.publicFieldsWhenFindAll, sort: { createdAt: -1 }, limit: GROUPS_PER_PAGE });
});

Meteor.publish('groups.findOne', function (id) { // Do not use arrow function here
  check(id, String);
  const transform = group => {
    const index = group.players.findIndex(p => p.id == this.userId);
    const role = group.players[index] && group.players[index].role || 'Unknown';
    group.players.forEach((p, i) => {
      if (i != index && p.role != 'Undecided') {
        p.role = Groups.ROLES[role] && Groups.ROLES[role].visions && Groups.ROLES[role].visions[p.role] || 'Unknown';
      }
    });
    return group;
  };
  const groups = Groups.find({ _id: id }, { fields: Groups.publicFieldsWhenFindOne }).observe({
    added: group => {
      this.added('Groups', group._id, transform(group));
    },
    changed: (newGroup, oldGroup) => {
      this.changed('Groups', oldGroup._id, transform(newGroup));
    },
    removed: group => {
      this.removed('Groups', group._id);
    }
  });
  this.onStop(() => { groups.stop(); });
  return this.ready();
});
