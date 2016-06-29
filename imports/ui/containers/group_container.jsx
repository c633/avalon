import { Meteor } from 'meteor/meteor';
import { Groups } from '../../api/groups/groups.js';
import { createContainer } from 'meteor/react-meteor-data';
import Group from '../pages/group.jsx';

export default createContainer(({ params: { id } }) => {
  let loaded = Meteor.subscribe('groups.find', id).ready();
  const group = Groups.findOne(id);
  loaded = loaded && Meteor.subscribe('users.find', group.ownerId).ready();
  return {
    group,
    loaded,
  };
}, Group);
