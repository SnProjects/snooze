import React, { useRef, useEffect } from 'react';

interface AudioPlayerProps {
  stream: MediaStream;
  muted?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ stream, muted = false }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  return <audio ref={audioRef} autoPlay muted={muted} controls style={{ display: 'none' }} />;
};

export default AudioPlayer;
