import React from 'react';
import { Link } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import Main from '../layouts/main';

export default class Group extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { group, loaded } = this.props;
    let content;
    if (loaded) {
      let owner = (
        <div>Owner: {group.owner().username}</div>
      );
      let players = group.players().map(player => (
        <div>{player.name}</div>
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

Group.propTypes = {
  group: React.PropTypes.object,
  loaded: React.PropTypes.bool,
};
