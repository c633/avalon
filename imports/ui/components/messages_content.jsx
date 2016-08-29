import React from 'react';
import { Messages } from '../../api/messages/messages.js';
import { sendMessage } from '../../api/groups/methods.js';
import { send } from '../../api/messages/methods.js';

export default class MessagesContent extends React.Component {
  constructor(props) {
    super(props);
    this.sendMessage = this.sendMessage.bind(this);
  }

  // REGION: Component Specifications

  render() {
    const { messages, canSend, groupId } = this.props;
    return (
      <div>
        <ul ref="messagesContainer" className="list-unstyled top_profiles scroll-view" style={{ height: '60vh' }}>
          {
            messages.map((m, i) => {
              const sender = Meteor.users.findOne(m.senderId);
              const otherPlayer = Meteor.userId() != m.senderId;
              return (
                <li key={i} className="media event">
                  <a href={`/users/${sender.username}`} className={`pull-${otherPlayer ? 'left' : 'right'} profile_thumb`}>
                    <img src={sender.getAvatarSrc()} className="img-responsive fa fa-user"/>
                  </a>
                  <div className="media-body">
                    <b>{sender.username}</b>
                    <p>{m.text}</p>
                    <p>
                      <small>{m.sentAt.toLocaleString('en-US', { hour12: false })}</small>
                    </p>
                  </div>
                </li>
              );
            })
          }
        </ul>
        {
          canSend ?
            <form onSubmit={this.sendMessage}>
              <div className="input-group">
                <input type="text" ref="text" name="text" className="form-control"/>
                <span className="input-group-btn">
                  <button type="submit" className="btn btn-primary">Send</button>
                </span>
              </div>
            </form> : null
        }
      </div>
    );
  }

  // REGION: Lifecycle Methods

  componentDidMount() {
    const node = this.refs.messagesContainer;
    node.scrollTop = node.scrollHeight;
  }

  componentWillUpdate() {
    const node = this.refs.messagesContainer;
    this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      const node = this.refs.messagesContainer;
      node.scrollTop = node.scrollHeight;
    }
  }

  // REGION: Handlers

  sendMessage(event) {
    event.preventDefault();
    const { groupId } = this.props;
    if (groupId) {
      sendMessage.call({ groupId: groupId, text: this.refs.text.value }, err => {
        if (err) {
          alert(err.reason);
        }
      });
    } else {
      send.call({ text: this.refs.text.value }, err => {
        if (err) {
          alert(err.reason);
        }
      });
    }
    this.refs.text.value = '';
  }
}

MessagesContent.propTypes = {
  messages: React.PropTypes.array,
  canSend: React.PropTypes.bool,
  groupId: React.PropTypes.string,
};
