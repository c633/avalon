import React, { Component } from 'react';
import GroupTable from '../components/group_table.jsx';

export default class Lobby extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { groups, loaded } = this.props;
    return loaded ? (
      <div>
        <div className="page-title">
          <div className="title_left">
            <h3>Lobby <small>Listing</small></h3>
          </div>
          <div className="title_right">
            <div className="col-md-5 col-sm-5 col-xs-12 form-group pull-right top_search">
              <div className="input-group">
                <input type="text" className="form-control" placeholder="Search for..."/>
                <span className="input-group-btn">
                  <button className="btn btn-default" type="button">Go!</button>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="clearfix"></div>
        <GroupTable groups={groups}/>
      </div>
    ) : null;
  }
}

Lobby.propTypes = {
  groups: React.PropTypes.array,
  loaded: React.PropTypes.bool,
};
