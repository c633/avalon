import React from 'react';
import { Groups } from '../../api/groups/groups.jsx'; // Constants only
import { sendMessage } from '../../api/groups/methods.js';

export default class MessagesContent extends React.Component {
  constructor(props) {
    super(props);
    this.sendMessage = this.sendMessage.bind(this);
  }

  // REGION: Component Specifications

  render() {
    const { group } = this.props;
    const messages = (
      <ul ref="messagesContainer" className="list-unstyled top_profiles scroll-view">
        {
          group.messages.map((m, i) => {
            const sender = Meteor.users.findOne(m.senderId);
            const otherPlayer = Meteor.userId() != m.senderId;
            return (
              <li key={i} className="media event">
                <a href={`/users/${m.senderId}`} className={`pull-${otherPlayer ? 'left' : 'right'} border-${group.hasPlayer(m.senderId) ? otherPlayer ? 'blue' : 'green' : 'dark'} profile_thumb`}>
                  <img src={sender.getAvatarSrc()} className={`img-responsive fa fa-user ${group.hasPlayer(m.senderId) ? otherPlayer ? 'blue' : 'green' : 'dark'}`}/>
                </a>
                <div className="media-body">
                  <b>{sender.username}</b>
                  <p>{m.text}</p>
                  <p>
                    <small>{m.sentAt.toLocaleString('en-US', { hour12: false })}</small>
                    {!group.hasPlayer(m.senderId) ? <span className="pull-right"><small>Left group</small></span> : null}
                  </p>
                </div>
              </li>
            );
          })
        }
      </ul>
    );
    return (
      <div>
        {messages}
        {
          group.hasPlayer(Meteor.userId()) ?
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
    const groupId = this.props.group._id;
    sendMessage.call({ groupId: groupId, text: this.refs.text.value }, err => {
      if (err) {
        alert(err.reason);
      } else {
        this.refs.text.value = '';
      }
    });
  }
}

MessagesContent.propTypes = {
  group: React.PropTypes.object,
};
