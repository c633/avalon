import React from 'react';
import { Groups } from '../../api/groups/groups.js'; // Constants only

export default class RoleCard extends React.Component {
  constructor(props) {
    super(props);
  }

  // REGION: Component Specifications

  render() {
    const { role, isSelected } = this.props;
    const name = Groups.RoleNames()[role];
    const image = name.toLowerCase();
    const side = role > 0 ? 'good' : 'evil';
    return (
      <div onClick={this.props.onClick} className="avalon-col-card-role profile_details">
        <button className="well profile_view avalon-card">
          <div className="col-sm-12">
            {isSelected ? <img src="/images/tokens/selected.png" className="img-responsive avalon-mark-right"/> : null}
            <img src={`/images/roles/${image}.jpg`} className="img-responsive"/>
            <p className={`avalon-${side}`}><strong>{side}</strong></p>
          </div>
          <div className="col-xs-12 bottom text-center">
            <div className="col-xs-12 col-sm-12 emphasis">
              <h2><strong>{name}</strong></h2>
            </div>
          </div>
        </button>
      </div>
    );
  }
}

RoleCard.propTypes = {
  role: React.PropTypes.number,
  isSelected: React.PropTypes.bool,
};
