import React from 'react';
import RolesContent from '../components/roles_content.jsx';
import PlayersContent from '../components/players_content.jsx';
import MessagesContent from '../components/messages_content.jsx';
import MissionsContent from '../components/missions_content.jsx';
import { MediumDevice, SmallAndTinyDevice } from '../layouts/devices.jsx';

export default class GroupPage extends React.Component {

  // REGION: Component Specifications

  render() {
    const { group, loaded } = this.props;
    return loaded ? (
      <div>
        <MediumDevice>
          <div className="row">
            <div className="col-xs-8">
              <div className="x_panel">
                <div className="x_content">
                  <RolesContent group={group}/>
                  <PlayersContent group={group}/>
                </div>
              </div>
            </div>
            <div className="col-xs-4">
              <div className="x_panel">
                <div className="x_title">
                  <h2><b>Group: {group.name}</b> (Owner: {group.getOwner().username})</h2>
                  <div className="clearfix"></div>
                </div>
                <div className="x_content">
                  <div role="tabpanel">
                    <ul className="nav nav-tabs bar_tabs" role="tablist">
                      <li role="presentation" className="active"><a href="#tab_messages" role="tab" data-toggle="tab" aria-expanded="false">Messages</a></li>
                      <li role="presentation" className=""><a href="#tab_missions" role="tab" data-toggle="tab" aria-expanded="true">Missions</a></li>
                    </ul>
                    <div className="tab-content">
                      <div role="tabpanel" className="tab-pane fade active in" id="tab_messages">
                        <MessagesContent group={group}/>
                      </div>
                      <div role="tabpanel" className="tab-pane fade" id="tab_missions">
                        <MissionsContent group={group}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MediumDevice>
        <SmallAndTinyDevice>
          <div className="x_panel">
            <div className="x_title">
              <h2><b>Group: {group.name}</b> (Owner: {group.getOwner().username})</h2>
              <div className="clearfix"></div>
            </div>
            <div className="x_content">
              <div role="tabpanel">
                <ul className="nav nav-tabs bar_tabs" role="tablist">
                  <li role="presentation" className="active"><a href="#tab_gameplay" role="tab" data-toggle="tab" aria-expanded="false">Gameplay</a></li>
                  <li role="presentation" className=""><a href="#tab_messages" role="tab" data-toggle="tab" aria-expanded="false">Messages</a></li>
                  <li role="presentation" className=""><a href="#tab_missions" role="tab" data-toggle="tab" aria-expanded="true">Missions</a></li>
                </ul>
                <div className="tab-content">
                  <div role="tabpanel" className="tab-pane fade active in" id="tab_gameplay">
                    <RolesContent group={group}/>
                    <PlayersContent group={group}/>
                  </div>
                  <div role="tabpanel" className="tab-pane fade" id="tab_messages">
                    <MessagesContent group={group}/>
                  </div>
                  <div role="tabpanel" className="tab-pane fade" id="tab_missions">
                    <MissionsContent group={group}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SmallAndTinyDevice>
      </div>
    ) : null;
  }
}

GroupPage.propTypes = {
  group: React.PropTypes.object,
  loaded: React.PropTypes.bool,
};
