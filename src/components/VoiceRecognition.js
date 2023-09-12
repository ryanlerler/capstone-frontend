import React, { useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Button } from "react-bootstrap";
import { PiMicrophoneFill } from "react-icons/pi";
import { RiPlayFill, RiStopFill } from "react-icons/ri";
import { IoMdRefreshCircle } from "react-icons/io";

export default function VoiceRecognition({ onTranscriptChange }) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    onTranscriptChange(transcript);
  }, [onTranscriptChange, transcript]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div>
      <p>
        <PiMicrophoneFill /> {listening ? "on" : "off"}
      </p>
      <Button
        onClick={SpeechRecognition.startListening}
        className="special-button"
      >
        <RiPlayFill />
      </Button>
      <Button
        onClick={SpeechRecognition.stopListening}
        className="special-button"
      >
        <RiStopFill />
      </Button>
      <Button onClick={resetTranscript} className="special-button">
        <IoMdRefreshCircle />
      </Button>
    </div>
  );
}
