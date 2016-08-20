import React from 'react';

export default class Rules extends React.Component {

  // REGION: Component Specifications

  render() {
    const gameplayPanel = (
      <div className="x_panel">
        <div className="x_title">
          <h3>Gameplay</h3>
          <div className="clearfix"></div>
        </div>
        <div className="x_content">
          <h3><b>Original 'The Resistance' game</b></h3>
          <h2>1. Start</h2>
          <ul>
            <li>
              One third of the group (rounded up) are randomly and secretly chosen to be <b className="avalon-evil">Evil</b> players infiltrating the rest of the group (<b className="avalon-good">Good</b> players). One of the players (either a <b className="avalon-evil">Evil</b> person or <b className="avalon-good">Good</b> person) is selected to be the first Mission <i>Leader</i>.
              <br/>
              <table className="table table-bordered projects" style={{ width: '60%' }}>
                <thead>
                  <tr>
                    <th>Number of players</th>
                    <th>5</th>
                    <th>6</th>
                    <th>7</th>
                    <th>8</th>
                    <th>9</th>
                    <th>10</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b className="avalon-good">Good</b> players</td>
                    <td>3</td>
                    <td>4</td>
                    <td>4</td>
                    <td>5</td>
                    <td>6</td>
                    <td>6</td>
                  </tr>
                  <tr>
                    <td><b className="avalon-evil">Evil</b> players</td>
                    <td>2</td>
                    <td>2</td>
                    <td>3</td>
                    <td>3</td>
                    <td>3</td>
                    <td>4</td>
                  </tr>
                </tbody>
              </table>
            </li>
            <li>The <b className="avalon-evil">Evil</b> players are made aware of each other without the <b className="avalon-good">Good</b> players knowing – the only thing the <b className="avalon-good">Good</b> players know is how many <b className="avalon-evil">Evil</b> players exist, not who they are.</li>
           <li>Players may never reveal their identity to other players.</li>
          </ul>
          <h2>2. Select mission team members</h2>
          <ul>
            <li>During each round of the game, the player to the left of the previous <i>Leader</i> becomes the new <i>Leader</i>.</li>
            <li>
              The <i>Leader</i> selects a certain number of players to send out on a mission (the <i>Leader</i> may choose to go out on the mission himself/herself), starting with Mission 1.
              <br/>
              <table className="table table-bordered projects" style={{ width: '60%' }}>
                <thead>
                  <tr>
                    <th>Number of players</th>
                    <th>5</th>
                    <th>6</th>
                    <th>7</th>
                    <th>8</th>
                    <th>9</th>
                    <th>10</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Mission 1</td>
                    <td>2</td>
                    <td>2</td>
                    <td>2</td>
                    <td>3</td>
                    <td>3</td>
                    <td>3</td>
                  </tr>
                  <tr>
                    <td>Mission 2</td>
                    <td>3</td>
                    <td>3</td>
                    <td>3</td>
                    <td>4</td>
                    <td>4</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>Mission 3</td>
                    <td>2</td>
                    <td>4</td>
                    <td>3</td>
                    <td>4</td>
                    <td>4</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>Mission 4</td>
                    <td>3</td>
                    <td>3</td>
                    <td>4*</td>
                    <td>5*</td>
                    <td>5*</td>
                    <td>5*</td>
                  </tr>
                  <tr>
                    <td>Mission 5</td>
                    <td>3</td>
                    <td>4</td>
                    <td>4</td>
                    <td>5</td>
                    <td>5</td>
                    <td>5</td>
                  </tr>
                </tbody>
              </table>
              Missions marked with an asterisk (*) require two <b className="avalon-evil">Fail</b> votes to be played in order for the mission to <b className="avalon-evil">Fail</b>.
            </li>
            <li>All of the players then discuss the <i>Leader</i>'s choice and, simultaneous and in public, vote on whether to accept the team make-up or not. If a majority of players votes no to the proposal or it's a tie, <i>Leadership</i> passes on to the next player to the left, who proposes their own mission.</li>
            <li>This continues until a majority of players agrees with the current <i>Leader</i>'s mission assignment. After <i>FIVE</i> rejected mission proposals in a row, the <b className="avalon-evil">Evil</b> players automatically win the game.</li>
          </ul>
          <h2>3. Go on mission</h2>
          <ul>
            <li>Once a mission team is agreed on, the players on the mission team perform a private vote. The <b className="avalon-good">Good</b> players must choose a Mission <b className="avalon-good">Success</b> vote, while the <b className="avalon-evil">Evil</b> players may either secretly turn in a Mission <b className="avalon-good">Success</b> or Mission <b className="avalon-evil">Fail</b> vote.</li>
            <li>If all votes show <b className="avalon-good">Success</b>, the <b className="avalon-good">Good</b> players earn one point. If even one vote shows <b className="avalon-evil">Fail</b>, the <b className="avalon-evil">Evil</b> players have sabotaged the mission and earn one point (except for the above-noted exceptions on Mission 4, where it may be necessary for <i>TWO</i> <b className="avalon-evil">Fail</b> votes to be played in order for the mission to <b className="avalon-evil">Fail</b>).</li>
            <li>The game continues until one team accumulates <i>THREE</i> points.</li>
          </ul>
          <h3><b>Avalon variant</b></h3>
          <ul>
            <li>The gameplay is significantly changed, by the addition of a role called <b className="avalon-role-merlin">Merlin</b>, a <b className="avalon-good">Good</b> player who is told at the beginning of the game who the <b className="avalon-evil">Evil</b> players are. If the <b className="avalon-evil">Evil</b> players lose the game, however, they have one last chance of redeeming themselves by correctly guessing Merlin's identity. If <b className="avalon-role-assassin">Assassin</b>, on the side of <b className="avalon-evil">Evil</b>, can do this, the <b className="avalon-evil">Evil</b> players win.</li>
            <li>The Resistance: Avalon works best when played with 7 or 8 players, as more specialty cards are added to the game based on how many players are playing as listed in <a href="#roles"><b>Roles table</b></a> at the right side.</li>
          </ul>
          Source: <a href="https://en.wikipedia.org/wiki/The_Resistance_(game)">Wikipedia</a>
        </div>
      </div>
    );
    const rolesPanel = (
      <div id="roles" className="x_panel">
        <div className="x_title">
          <h3>Roles</h3>
          <div className="clearfix"></div>
        </div>
        <div className="x_content">
          <table className="table table-bordered projects">
            <tbody>
              <tr>
                <td style={{ width: '15%' }}><img src="/images/roles/servant.jpg" className="img-responsive"/></td>
                <td><b className="avalon-role-servant">Servant</b>: Loyal servant of Arthur, only knows how many evil players exist, not who they are.</td>
              </tr>
              <tr>
                <td><img src="/images/roles/merlin.jpg" className="img-responsive"/></td>
                <td><b className="avalon-role-merlin">Merlin</b>: Knows who the evil players are.</td>
              </tr>
              <tr>
                <td><img src="/images/roles/percival.jpg" className="img-responsive"/></td>
                <td><b className="avalon-role-percival">Percival</b> (<i>addition</i>): Knows who Merlin is and is in a position to help protect Merlin's identity.</td>
              </tr>
              <tr>
                <td><img src="/images/roles/minion.jpg" className="img-responsive"/></td>
                <td><b className="avalon-role-minion">Minion</b>: Minion of Mordred, are made aware of each other without the good players knowing.</td>
              </tr>
              <tr>
                <td><img src="/images/roles/assassin.jpg" className="img-responsive"/></td>
                <td><b className="avalon-role-assassin">Assassin</b>: Guesses Merlin's identity to take last chance of redeeming when the evil players lose the game.</td>
              </tr>
              <tr>
                <td><img src="/images/roles/mordred.jpg" className="img-responsive"/></td>
                <td><b className="avalon-role-mordred">Mordred</b> (<i>addition</i>): Does not reveal his identity to Merlin, leaving Merlin in the dark.</td>
              </tr>
              <tr>
                <td><img src="/images/roles/morgana.jpg" className="img-responsive"/></td>
                <td><b className="avalon-role-morgana">Morgana</b> (<i>addition</i>): Appears to be Merlin, revealing herself to Percival as Merlin.</td>
              </tr>
              <tr>
                <td><img src="/images/roles/oberon.jpg" className="img-responsive"/></td>
                <td><b className="avalon-role-oberon">Oberon</b> (<i>addition</i>): Does not reveal himself to the other evil players, nor does he gain knowledge of the other evil players.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
    const style = { width: '40px' };
    const symbolsPanel = (
      <div className="x_panel">
        <div className="x_title">
          <h3>Symbols</h3>
          <div className="clearfix"></div>
        </div>
        <div className="x_content">
          <table className="table table-bordered projects">
            <tbody>
              <tr>
                <td style={style}><img src="/images/tokens/selected.png" className="img-responsive"/></td>
                <td>Selected additional role.</td>
                <td style={style}><img src="/images/tokens/guessed.png" className="img-responsive"/></td>
                <td>Guessed as Merlin.</td>
              </tr>
              <tr>
                <td style={style}><img src="/images/tokens/leader.png" className="img-responsive"/></td>
                <td>Leader.</td>
                <td style={style}><img src="/images/tokens/member.png" className="img-responsive"/></td>
                <td>Team member.</td>
              </tr>
              <tr>
                <td style={style}><img src="/images/tokens/undecided.png" className="img-responsive"/></td>
                <td>Undecided.</td>
                <td style={style}><img src="/images/tokens/waiting.png" className="img-responsive"/></td>
                <td>Waiting for vote.</td>
              </tr>
              <tr>
                <td style={style}><img src="/images/tokens/approved.png" className="img-responsive"/></td>
                <td>Approved team.</td>
                <td style={style}><img src="/images/tokens/denied.png" className="img-responsive"/></td>
                <td>Denied team.</td>
              </tr>
              <tr>
                <td style={style}><img src="/images/tokens/voted-success.png" className="img-responsive"/></td>
                <td>Voted success.</td>
                <td style={style}><img src="/images/tokens/voted-fail.png" className="img-responsive"/></td>
                <td>Voted fail.</td>
              </tr>
              <tr>
                <td style={style}><img src="/images/tokens/playing.png" className="img-responsive"/></td>
                <td>Mission is playing.</td>
                <td style={style}><img src="/images/tokens/mission-denied.png" className="img-responsive"/></td>
                <td>Mission is denied.</td>
              </tr>
              <tr>
                <td style={style}><img src="/images/tokens/mission-success.png" className="img-responsive"/></td>
                <td>Mission success.</td>
                <td style={style}><img src="/images/tokens/mission-fail.png" className="img-responsive"/></td>
                <td>Mission fail.</td>
              </tr>
              <tr>
                <td style={style}>
                  <div className="avalon-token" style={{ width: '100%', backgroundColor: '#3498DB', borderRadius: '50%' }}>
                    <span style={{ fontSize: 'larger' }}>4</span>
                    <img className="img-responsive avalon-token-mark-bottom" style={{ width: '16px', height: '16px', bottom: '-6px', right: '-6px' }} src="/images/tokens/more-fail-votes.png"/>
                  </div>
                </td>
                <td colSpan="3">
                  Mission is not played yet, with number of required members.<br/>
                  Warning mark (option): need 2 fail votes to be fail.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
    return (
      <div style={{ fontSize: '14px' }}>
        <div className="page-title">
          <div className="title_left">
            <h3>Rules<small></small></h3>
          </div>
        </div>
        <div className="clearfix"></div>
        <div className="row">
          <div className="col-md-8">
            {gameplayPanel}
          </div>
          <div className="col-md-4">
            {rolesPanel}
            {symbolsPanel}
          </div>
        </div>
      </div>
    );
  }
}
