import React from 'react';
import { Groups } from '../../api/groups/groups.jsx'; // Constants only
import { sendMessage } from '../../api/groups/methods.js';

export default class SummariesContent extends React.Component {

  // REGION: Component Specifications

  render() {
    const { group } = this.props;
    const players = group.getPlayers();
    return (
      <div className="avalon-summaries">
        <div role="tablist" aria-multiselectable="true">
          {
            group.getSummaries().map((m, i) => {
              const lastResult = (m.length > 0 || null) && m[m.length - 1].result;
              return (
                <div key={i} className="panel">
                  <div className="panel-heading" role="tab" aria-expanded="true">
                    <span className={`panel-title${lastResult === undefined ? '' : ` avalon-${lastResult ? 'good' : 'evil'}`}`}><b>Mission {i + 1}</b> ({lastResult === undefined ? 'Playing' : lastResult == null ? 'Denied' : lastResult ? 'Success' : 'Fail'})</span>
                    <img src={`/images/tokens/${lastResult === undefined ? 'playing' : `mission-${lastResult == null ? 'denied' : lastResult ? 'success' : 'fail'}`}.png`} className="pull-right avalon-summary-result"/>
                  </div>
                  <div role="tabpanel">
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
  }
}

SummariesContent.propTypes = {
  group: React.PropTypes.object,
};
