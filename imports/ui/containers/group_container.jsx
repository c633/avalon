import { Meteor } from 'meteor/meteor';
import { Groups } from '../../api/groups/groups.js';
import { createContainer } from 'meteor/react-meteor-data';
import GroupPage from '../pages/group_page.jsx';

export default createContainer(({ params: { id } }) => {
  const group = Groups.findOne(id);
  const loaded = Meteor.subscribe('groups.findOne', id).ready() && Meteor.subscribe('users.findAll').ready();
  return {
    group,
    loaded,
  };
}, GroupPage);
