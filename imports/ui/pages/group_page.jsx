import React from 'react';
import AdditionalRolesPanel from '../components/additional_roles_panel.jsx';
import PlayersPanel from '../components/players_panel.jsx';
import HistoryPanel from '../components/history_panel.jsx';

export default class GroupPage extends React.Component {

  // REGION: Component Specifications

  render() {
    const { group, loaded } = this.props;
    return loaded ? (
      <div>
        <div className="page-title">
          <div className="title_left">
            <h3><small></small></h3>
          </div>
        </div>
        <div className="clearfix"></div>
        <div className="row">
          <div className="col-md-8">
            <AdditionalRolesPanel group={group}/>
            <PlayersPanel group={group}/>
          </div>
          <div className="col-md-4">
            <HistoryPanel group={group}/>
          </div>
        </div>
      </div>
    ) : null;
  }
}

GroupPage.propTypes = {
  group: React.PropTypes.object,
  loaded: React.PropTypes.bool,
};
