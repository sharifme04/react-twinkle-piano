import React from 'react';
import _ from 'lodash';
import { KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';

import AudioProvider from './components/AudioProvider';
import PianoWithRecording from './components/PianoWithRecording';
import TableRow from './components/TableRow';

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundfontHostname = 'https://d1pzp51pvbm36p.cloudfront.net';

const noteRange = {
  first: MidiNumbers.fromNote('c3'),
  last: MidiNumbers.fromNote('f4'),
};
const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: noteRange.first,
  lastNote: noteRange.last,
  keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recording: {
        mode: 'RECORDING',
        events: [],
        currentTime: 0,
        currentEvents: [],
      },
      startRecord:false
    };
    this.scheduledEvents = [];

    this.onClickReplay = this.onClickReplay.bind(this);
    this.onClickStop   = this.onClickStop.bind(this);
    this.onClickDelete = this.onClickDelete.bind(this);
    this.startRecordHandle = this.startRecordHandle.bind(this);
  }

  startRecordHandle = value => {
    this.setState(prevState => ({
      startRecord: !prevState.startRecord
      }));
    };

  getRecordingEndTime = () => {
    if (this.state.recording.events.length === 0) {
      return 0;
    }
    return Math.max(
      ...this.state.recording.events.map(event => event.time + event.duration),
    );
  };

  setRecording = value => {
    this.setState({
      recording: Object.assign({}, this.state.recording, value),
    });
  };

  onClickReplay = () => {
    this.setRecording({
      mode: 'PLAYING',
    });
    const startAndEndTimes = _.uniq(
      _.flatMap(this.state.recording.events, event => [
        event.time,
        event.time + event.duration,
      ]),
    );
    startAndEndTimes.forEach(time => {
      this.scheduledEvents.push(
        setTimeout(() => {
          const currentEvents = this.state.recording.events.filter(event => {
            return event.time <= time && event.time + event.duration > time;
          });
          this.setRecording({
            currentEvents,
          });
        }, time * 1000),
      );
    });
    setTimeout(() => {
      this.onClickStop();
    }, this.getRecordingEndTime() * 1000);
  };

  onClickStop = () => {
    this.scheduledEvents.forEach(scheduledEvent => {
      clearTimeout(scheduledEvent);
    });
    this.setRecording({
      mode: 'RECORDING',
      currentEvents: [],
    });
  };

  onClickDelete = () => {
    this.onClickStop();
    this.setRecording({
      events: [],
      mode: 'RECORDING',
      currentEvents: [],
      currentTime: 0,
    });
  };

  render() {
       this.trackRecords = this.state.recording.events.map(trackRecord =>
        <TableRow key={trackRecord.time} trackRecord={trackRecord}/>)
    return (
      <div className="container">
        <h1 className="h3">React Piano App</h1>
        <hr/>
        <div className="App-header">
        <div >
          <AudioProvider
            instrumentName="acoustic_grand_piano"
            audioContext={audioContext}
            hostname={soundfontHostname}
            render={({ isLoading, playNote, stopNote }) => (
              <PianoWithRecording
                recording={this.state.recording}
                setRecording={this.setRecording}
                noteRange={noteRange}
                width={1000}
                playNote={playNote}
                stopNote={stopNote}
                disabled={isLoading}
                startRecord={this.state.startRecord}
                keyboardShortcuts={keyboardShortcuts}
              />
            )}
          />
        </div>
        <hr/>
        <div>
          <button onClick={this.startRecordHandle} className={this.state.startRecord? "btn btn-primary": "btn btn-success"}>{this.state.startRecord? "Stop Recording": "Start Recording"}</button>
          <button onClick={this.onClickReplay} className="btn btn-info">Replay</button>
          <button onClick={this.onClickStop} className="btn btn-basic">Stop Replay</button>
          <button onClick={this.onClickDelete} className="btn btn-danger">Delete Records</button>
        </div>
        <div>
          <h3>Recorded Tracks</h3>
          <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Title</th>
                <th>Total Time</th>
                <th>Duration Unit</th>
              </tr>
            </thead>
            <tbody>
              {this.trackRecords}
            </tbody>
          </table>
          </div>
        </div>
       </div>
      </div>
    );
  }
}

export default App;
