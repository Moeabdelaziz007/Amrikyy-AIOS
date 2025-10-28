import React, { useState, useEffect } from 'react';
import { UserAccount } from '../../types';
import { VeridianIdIcon, SparklesIcon } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Props for the VeridianIdApp component.
 */
interface VeridianIdAppProps {
    /** The user's account information, including OS ID, join date, and trust score. */
    userAccount: UserAccount;
}

/**
 * The VeridianIdApp displays the user's verifiable digital identity within the OS.
 * It shows the OS ID, join date, and a dynamic trust score. A mock QR code is included for demonstration.
 * @param {VeridianIdAppProps} props - The component props.
 * @returns {JSX.Element} The VeridianIdApp component.
 */
const VeridianIdApp: React.FC<VeridianIdAppProps> = ({ userAccount }) => {
    const { t } = useLanguage();
    const [trustScore, setTrustScore] = useState(userAccount.trustScore);

    // Simulate dynamic trust score based on time/activity
    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly increase or decrease trust score between 50 and 100
            setTrustScore(prev => Math.min(100, Math.max(50, prev + (Math.random() > 0.5 ? 1 : -1))));
        }, 10000); // Update every 10 seconds
        return () => clearInterval(interval);
    }, []);

    // Placeholder for a QR code. In a real app, this would be generated based on user data.
    const qrCodeSvg = `
        <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="150" height="150" fill="#FFFFFF"/>
        <rect x="20" y="20" width="30" height="30" fill="#000000"/>
        <rect x="100" y="20" width="30" height="30" fill="#000000"/>
        <rect x="20" y="100" width="30" height="30" fill="#000000"/>
        <rect x="30" y="30" width="10" height="10" fill="#FFFFFF"/>
        <rect x="110" y="30" width="10" height="10" fill="#FFFFFF"/>
        <rect x="30" y="110" width="10" height="10" fill="#FFFFFF"/>
        
        <rect x="60" y="40" width="10" height="10" fill="#000000"/>
        <rect x="70" y="40" width="10" height="10" fill="#000000"/>
        <rect x="80" y="40" width="10" height="10" fill="#000000"/>
        
        <rect x="40" y="70" width="10" height="10" fill="#000000"/>
        <rect x="40" y="80" width="10" height="10" fill="#000000"/>
        <rect x="40" y="90" width="10" height="10" fill="#000000"/>

        <rect x="90" y="60" width="10" height="10" fill="#000000"/>
        <rect x="100" y="60" width="10" height="10" fill="#000000"/>
        <rect x="110" y="60" width="10" height="10" fill="#000000"/>

        <rect x="70" y="100" width="10" height="10" fill="#000000"/>
        <rect x="80" y="100" width="10" height="10" fill="#000000"/>
        <rect x="90" y="100" width="10" height="10" fill="#000000"/>
        </svg>
    `;

    return (
        <div className="h-full w-full flex flex-col bg-bg-tertiary rounded-b-md text-white p-6 gap-6 overflow-y-auto">
            <div className="text-center">
                <VeridianIdIcon className="w-16 h-16 mx-auto mb-2 text-primary-cyan" />
                <h1 className="text-3xl font-bold font-display">{t('app_titles.veridianId')}</h1>
                <p className="text-text-muted mt-2">{t('veridian_id.verified_by')}</p>
            </div>

            <div className="w-full max-w-sm mx-auto bg-black/20 border border-white/10 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-sm text-text-secondary">{t('veridian_id.os_id')}</span>
                    <span className="font-mono text-base font-semibold text-white/90">{userAccount.osId}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-sm text-text-secondary">{t('veridian_id.join_date')}</span>
                    <span className="font-mono text-base font-semibold text-white/90">{userAccount.joinDate}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">{t('veridian_id.trust_score')}</span>
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-green-400" />
                        <span className="font-mono text-base font-semibold text-green-400">{trustScore}/100</span>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-sm mx-auto text-center p-4 bg-black/20 border border-white/10 rounded-xl">
                <div className="mx-auto" dangerouslySetInnerHTML={{ __html: qrCodeSvg }} aria-label={t('veridian_id.scan_to_verify')} />
                <p className="text-xs text-text-muted mt-3">{t('veridian_id.scan_to_verify')}</p>
            </div>
        </div>
    );
};

export default VeridianIdApp;