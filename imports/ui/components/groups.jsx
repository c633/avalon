import React from 'react';
import { Link } from 'react-router';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { insert } from '../../api/groups/methods.js';

export default class Groups extends React.Component {
  constructor(props) {
    super(props);
    this.create = this.create.bind(this);
  }

  create() {
    const { router } = this.context;
    const groupId = insert.call({
      name: this.refs.name.getValue(),
    }, (err) => {
      if (err) {
        // router.push('/');
        alert('Could not create group.');
      }
    });
    // router.push(`/groups/${ groupId }`);
  }

  render() {
    const { groups } = this.props;
    var formCreateGroup;
    if (Meteor.user()) { // Render form for creating new 'Group' if user has already logged in
      formCreateGroup = (
        <div>
          <form onSubmit={this.create}>
            <TextField hintText="Name" ref="name" name="name"/>
            <RaisedButton primary={true} label="Create new group" type="submit"/>
          </form>
        </div>); 
    }
    return (
      <div>
        {formCreateGroup}
        <div>
        {groups.map(group => (
          <div key={group._id}>
            {group.name}
          </div>
        ))}
        </div>
      </div>
    );
  }
}

Groups.propTypes = {
  groups: React.PropTypes.array,
};

Groups.contextTypes = {
  router: React.PropTypes.object,
};
