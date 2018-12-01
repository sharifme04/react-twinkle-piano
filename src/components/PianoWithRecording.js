import React from 'react';
import { Piano } from 'react-piano';

const DEFAULT_NOTE_DURATION = 0.2;

class PianoWithRecording extends React.Component {
  static defaultProps = {
    notesRecorded: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      keysDown: {},
      noteDuration: DEFAULT_NOTE_DURATION,
    };

   this.onPlayNoteInput = this.onPlayNoteInput.bind(this);
   this.onStopNoteInput = this.onStopNoteInput.bind(this);
  }


  onPlayNoteInput = midiNumber => {
    this.setState({
      notesRecorded: false,
    });
  };

  onStopNoteInput = (midiNumber, { prevActiveNotes }) => {
    if (this.state.notesRecorded === false) {
      this.recordNotes(prevActiveNotes, this.state.noteDuration);
      this.setState({
        notesRecorded: true,
        noteDuration: DEFAULT_NOTE_DURATION,
      });
    }
  };

  recordNotes = (midiNumbers, duration) => {
    if (this.props.recording.mode !== 'RECORDING') {
      return;
    }
    const newEvents = midiNumbers.map(midiNumber => {
      return {
        midiNumber:midiNumber,
        time: this.props.recording.currentTime,
        duration: duration,
        title: 'Track '+midiNumber,
      };
    });
    this.props.setRecording({
      events: this.props.recording.events.concat(newEvents),
      currentTime: this.props.recording.currentTime + duration,
    });
  };

  render() {
    const {
      playNote,
      stopNote,
      recording,
      setRecording,
      ...pianoProps
    } = this.props;

    const { mode, currentEvents } = this.props.recording;
    const activeNotes =
      mode === 'PLAYING' ? currentEvents.map(event => event.midiNumber) : null;
    return (
      <div>
        <Piano
          playNote={this.props.playNote}
          stopNote={this.props.stopNote}
          onPlayNoteInput={this.onPlayNoteInput}
          onStopNoteInput={this.onStopNoteInput}
          activeNotes={activeNotes}
          {...pianoProps}
        />
      </div>
    );
  }
}

export default PianoWithRecording;
