import React from 'react';
import { Groups } from '../../api/groups/groups.jsx'; // Constants only

export default class RoleCard extends React.Component {
  constructor(props) {
    super(props);
  }

  // REGION: Component Specifications

  render() {
    const { isSelectable, isSelected, role } = this.props;
    const name = Groups.RoleNames()[role];
    const image = name.toLowerCase();
    const side = role > 0 ? 'good' : 'evil';
    return (
      <div onClick={this.props.onClick} className="avalon-col-card-role profile_details">
        <button className={`well profile_view avalon-card${isSelectable ? '' : '-disable'}`}>
          <div className="col-sm-12">
            {isSelected ? <img src="/images/tokens/selected.png" className="img-responsive avalon-card-mark-right"/> : null}
            <img src={`/images/roles/${image}.jpg`} className="img-responsive"/>
            <p className={`avalon-${side}`}><b>{side}</b></p>
          </div>
          <div className="col-xs-12 bottom text-center">
            <div className="col-xs-12 col-sm-12 emphasis">
              <h2><b>{name}</b></h2>
            </div>
          </div>
        </button>
      </div>
    );
  }
}

RoleCard.propTypes = {
  isSelectable: React.PropTypes.bool,
  isSelected: React.PropTypes.bool,
  role: React.PropTypes.number,
};
