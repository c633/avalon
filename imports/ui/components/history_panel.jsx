import React from 'react';
import { Groups } from '../../api/groups/groups.js'; // Constants only
import { sendMessage } from '../../api/groups/methods.js';

export default class HistoryPanel extends React.Component {
  constructor(props) {
    super(props);
    this.sendMessage = this.sendMessage.bind(this);
  }

  // REGION: Component Specifications

  render() {
    const { group } = this.props;
    const players = group.getPlayers();
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
                  <strong>{sender.username}</strong>
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
    const summaries = (
      <div className="avalon-summaries">
        <div className="accordion" role="tablist" aria-multiselectable="true">
          {
            group.getSummaries().map((m, i) => {
              const lastResult = m[m.length - 1].result;
              return (
                <div key={i} className="panel">
                  <div className="panel-heading" role="tab" aria-expanded="true">
                    <span className={`panel-title${lastResult === undefined ? '' : ` avalon-${lastResult ? 'good' : 'evil'}`}`}><strong>Mission {i + 1}</strong> ({lastResult === undefined ? 'Playing' : lastResult ? 'Success' : 'Fail'})</span>
                    <img src={`/images/tokens/${lastResult === undefined ? 'playing' : `mission-${lastResult ? 'success' : 'fail'}` }.png`} className="pull-right avalon-summary-result"/>
                  </div>
                  <div className="panel-collapse collapse in" role="tabpanel">
                    <div className="panel-body">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Team members</th>
                            <th>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            m.map((t, j) =>
                              <tr key={j}>
                                <th scope="row">{j + 1}</th>
                                <td>{t.memberIndices.map(i => <div key={i}>{players[i].user.username}</div>)}</td>
                                <td>{t.result === undefined ? '' : t.result == null ? <div>Denied by<br/>{t.denierIndices.length} player(s)</div> : t.result ? 'Success' : <div>Fail with <br/>{t.failVotesCount} fail vote(s)</div>}</td>
                              </tr>
                            )
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
    return (
      <div className="x_panel">
        <div className="x_title">
          <h2><strong>Group: {group.name}</strong> (Owner: {group.getOwner().username})</h2>
          <div className="clearfix"></div>
        </div>
        <div className="x_content">
          <div role="tabpanel">
            <ul className="nav nav-tabs bar_tabs" role="tablist">
              <li role="presentation" className="active"><a href="#tab_messages" role="tab" data-toggle="tab" aria-expanded="false">Messages</a></li>
              <li role="presentation" className=""><a href="#tab_summaries" role="tab" data-toggle="tab" aria-expanded="true">Summaries</a></li>
            </ul>
            <div className="tab-content">
              <div role="tabpanel" className="tab-pane fade active in" id="tab_messages">
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
              <div role="tabpanel" className="tab-pane fade" id="tab_summaries">
                {summaries}
              </div>
            </div>
          </div>
        </div>
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

HistoryPanel.propTypes = {
  group: React.PropTypes.object,
};
