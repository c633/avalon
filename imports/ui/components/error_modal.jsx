import React from 'react';
import ReactDom from 'react-dom';

export default class ErrorModal extends React.Component {
  constructor(props) {
    super(props);
  }

  // REGION: Component Specifications

  render() {
    return (
      <div className="modal fade" role="dialog" aria-hidden="true">
        <div className="modal-dialog modal-md">
          <div className="modal-content">
            <div className="modal-body">
              <h4>{this.props.reason}</h4>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REGION: Lifecycle Methods

  componentDidMount() {
    $(ReactDom.findDOMNode(this)).modal('show');
    $(ReactDom.findDOMNode(this)).on('hidden.bs.modal', this.props.hide);
  }
}

ErrorModal.propTypes = {
  hide: React.PropTypes.func,
  reason: React.PropTypes.string,
};
