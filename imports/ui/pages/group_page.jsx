import React from 'react';
import { Link } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import Main from '../layouts/main';

export default class GroupPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { group, loaded } = this.props;
    let content;
    if (loaded) {
      let owner = (
        <div>Owner: {group.getOwner().username}</div>
      );
      let players = group.getPlayers().map(player => (
        <div key={player._id}>{player.username}</div>
      ));
      content = (
        <div>
          <RaisedButton primary={true} containerElement={<Link to="/"/>} linkButton={true} label="Home"/>
          <div>Group's name: {group.name}</div>
          {owner}
          Players:
          {players}
        </div>
      );
    }
    return <Main content={content}/>;
  }
}

GroupPage.propTypes = {
  group: React.PropTypes.object,
  loaded: React.PropTypes.bool,
};
