import { Meteor } from 'meteor/meteor';
import { Groups } from '../../api/groups/groups.jsx';
import { createContainer } from 'meteor/react-meteor-data';
import GroupPage from '../pages/group_page.jsx';

export default createContainer(({ params: { name } }) => {
  const group = Groups.findOne({ name: name });
  const loaded = Meteor.subscribe('groups.findOneByName', name).ready() && Meteor.subscribe('users.findAll').ready();
  return {
    _user: Meteor.user(), // NOTE: Additional prop: make page automatically re-render even if user logged out
    group: group,
    loaded: loaded,
  };
}, GroupPage);
