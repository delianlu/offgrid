import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';

interface DuelScannerProps {
    onBack: () => void;
}

export const DuelScanner: React.FC<DuelScannerProps> = ({ onBack }) => {
    const navigate = useNavigate();
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize scanner
        // Use a timeout to ensure the DOM element exists
        const timer = setTimeout(() => {
            if (!scannerRef.current) {
                const scanner = new Html5QrcodeScanner(
                    "reader",
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    },
          /* verbose= */ false
                );

                scanner.render(
                    (decodedText) => {
                        // Success callback
                        handleScanSuccess(decodedText);
                    },
                    (errorMessage) => {
                        // Error callback (ignore frequent scan errors)
                        // console.log(errorMessage);
                    }
                );

                scannerRef.current = scanner;
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, []);

    const handleScanSuccess = (decodedText: string) => {
        try {
            // Expected format: app://duel?topic=...&seed=...&diff=...
            // Or full URL: http://.../duel?topic=...

            const url = new URL(decodedText);
            const params = new URLSearchParams(url.search);

            const topic = params.get('topic');
            const seed = params.get('seed');
            const diff = params.get('diff');

            if (topic && seed) {
                // Stop scanning
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(console.error);
                }

                // Navigate to challenge
                navigate(`/challenge?topic=${topic}&seed=${seed}&diff=${diff || 'medium'}`);
            } else {
                setError("Invalid QR Code format");
            }
        } catch (e) {
            setError("Could not parse QR Code");
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center mb-6">
                <button
                    onClick={onBack}
                    className="mr-4 p-2 rounded-full hover:bg-gray-100"
                >
                    ←
                </button>
                <h2 className="text-2xl font-bold">Scan Challenge</h2>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center bg-black rounded-2xl overflow-hidden relative">
                <div id="reader" className="w-full h-full max-w-md"></div>

                {error && (
                    <div className="absolute bottom-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg text-center">
                        {error}
                    </div>
                )}
            </div>

            <p className="text-center text-gray-500 mt-4 text-sm">
                Point your camera at a friend's Duel QR Code
            </p>
        </div>
    );
};
