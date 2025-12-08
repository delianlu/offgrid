import { useState, useRef, useEffect } from 'react';
import { AudioButton } from './AudioButton';

interface VoiceRecorderProps {
    modelText: string;
    onRecordingComplete?: (blob: Blob) => void;
}

export function VoiceRecorder({ modelText, onRecordingComplete }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Cleanup URL on unmount
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                if (onRecordingComplete) {
                    onRecordingComplete(blob);
                }

                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setError(null);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setError('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const playRecording = () => {
        if (audioUrl) {
            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                audioRef.current.play();
                setIsPlaying(true);
                audioRef.current.onended = () => setIsPlaying(false);
            }
        }
    };

    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-sm">
            <div className="flex flex-col items-center space-y-6">

                {/* Model Pronunciation Section */}
                <div className="text-center space-y-2">
                    <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">1. Listen to Model</p>
                    <div className="flex items-center justify-center space-x-3 bg-blue-50 px-6 py-3 rounded-full">
                        <span className="text-xl font-bold text-gray-800">{modelText}</span>
                        <AudioButton text={modelText} size="lg" />
                    </div>
                </div>

                {/* Recording Section */}
                <div className="text-center space-y-2 w-full">
                    <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">2. Record Yourself</p>

                    <div className="flex justify-center">
                        {!isRecording ? (
                            <button
                                onClick={startRecording}
                                className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all transform hover:scale-105 active:scale-95"
                                title="Start Recording"
                            >
                                <span className="text-2xl">🎤</span>
                                <span className="absolute -bottom-8 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Tap to Record
                                </span>
                            </button>
                        ) : (
                            <button
                                onClick={stopRecording}
                                className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-900 text-white shadow-lg animate-pulse"
                                title="Stop Recording"
                            >
                                <div className="w-6 h-6 bg-white rounded-sm"></div>
                                <span className="absolute -bottom-8 text-xs text-red-500 font-medium whitespace-nowrap">
                                    Recording...
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Playback Section */}
                {audioUrl && (
                    <div className="text-center space-y-2 w-full animate-fade-in">
                        <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">3. Compare</p>
                        <button
                            onClick={playRecording}
                            disabled={isPlaying}
                            className={`
                flex items-center justify-center space-x-2 w-full py-3 rounded-lg font-medium transition-all
                ${isPlaying
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'}
              `}
                        >
                            <span>{isPlaying ? 'Playing...' : '▶️ Play My Voice'}</span>
                        </button>
                        <audio ref={audioRef} className="hidden" />
                    </div>
                )}

                {error && (
                    <div className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
