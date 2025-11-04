import React, { useState } from 'react';
import { GmailMessage } from '../../types';
import { GmailIcon, SendIcon } from '../Icons.tsx';

/**
 * Props for the GmailApp component.
 */
interface GmailAppProps {
    /** An array of Gmail messages to display. */
    messages: GmailMessage[];
    /** A boolean indicating if the messages are currently loading. */
    isLoading: boolean;
}

/**
 * The GmailApp component displays a list of emails.
 * This is a basic implementation for viewing messages.
 * @param {GmailAppProps} props - The component props.
 * @returns {JSX.Element} The GmailApp component.
 */
const GmailApp: React.FC<GmailAppProps> = ({ messages, isLoading }) => {
    const [isComposing, setIsComposing] = useState(false);

    return (
        <div className="h-full w-full flex flex-col bg-white rounded-b-md text-gray-800">
            <header className="p-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <GmailIcon className="w-6 h-6 text-red-500" />
                    <h2 className="text-lg font-semibold">Inbox</h2>
                </div>
                <button
                    onClick={() => setIsComposing(!isComposing)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                    {isComposing ? 'Cancel' : 'Compose'}
                </button>
            </header>
            <main className="flex-grow overflow-y-auto">
                {isComposing ? (
                    <div className="p-4">
                        <input type="text" placeholder="To" className="w-full p-2 mb-2 border rounded" />
                        <input type="text" placeholder="Subject" className="w-full p-2 mb-2 border rounded" />
                        <textarea placeholder="Message" className="w-full p-2 mb-2 border rounded" rows={10}></textarea>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2">
                            <SendIcon className="w-5 h-5" />
                            Send
                        </button>
                    </div>
                ) : isLoading ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : messages.length > 0 ? (
                    <ul>
                        {messages.map((message) => (
                            <li key={message.id} className="border-b border-gray-200 p-3 hover:bg-gray-50 cursor-pointer">
                                <div className="font-semibold text-gray-900">{message.from}</div>
                                <div className="text-gray-700 truncate">{message.subject}</div>
                                <div className="text-gray-500 text-sm truncate">{message.snippet}</div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        <p>No messages to display.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default GmailApp;
