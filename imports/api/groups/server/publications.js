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
  return Groups.find(selector, { fields: Groups.publicFields.findAll, sort: { createdAt: -1 }, limit: GROUPS_PER_PAGE });
});

Meteor.publish('groups.findOne', id => {
  check(id, String);
  return Groups.find({ _id: id }, { fields: Groups.publicFields.findOne });
});
