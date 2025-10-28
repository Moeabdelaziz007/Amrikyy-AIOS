import React, { useState, useEffect } from 'react';
import { MapIcon, SparklesIcon } from '../Icons';
import { mapsSearch } from '../../services/geminiAdvancedService';

/**
 * The MapsApp component provides an AI-powered interface for searching geographical information.
 * It uses the user's current geolocation and Google Maps for grounding.
 * @returns {JSX.Element} The MapsApp component.
 */
const MapsApp: React.FC = () => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<string | null>(null);

    // Fetches the user's current geolocation on component mount.
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setError(null);
            },
            (error) => {
                setError(`Geolocation error: ${error.message}. Please enable location services.`);
                setLocation(null);
            }
        );
    }, []);

    /**
     * Handles sending a map-related query to the AI.
     * Requires user's location to be available.
     */
    const handleSend = async () => {
        if (!input || isLoading || !location) return;
        setIsLoading(true);
        setResponse(null);

        try {
            const result = await mapsSearch(input, location);
            setResponse(result.text);
        } catch (e) {
            setError("Failed to get a response from the Maps AI.");
        }

        setIsLoading(false);
    };

    return (
      <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white">
        <div className="flex-grow p-6 flex flex-col items-center justify-center gap-6 overflow-y-auto">
            <div className="text-center">
                <MapIcon className="w-16 h-16 mx-auto mb-2 text-emerald-400" />
                <h1 className="text-2xl font-bold font-display">AI Maps</h1>
                <p className="text-text-muted">Ask for places, directions, or local info.</p>
                {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
                {location && <p className="text-sm text-green-400 mt-2">Location acquired.</p>}
            </div>

            <div className="w-full max-w-lg p-4 bg-black/20 border border-white/10 rounded-xl min-h-[100px] flex items-center justify-center">
                {isLoading ? (
                    <div className="flex items-center gap-3 justify-center text-emerald-400">
                        <SparklesIcon className="w-6 h-6 animate-pulse" />
                        <p>Searching