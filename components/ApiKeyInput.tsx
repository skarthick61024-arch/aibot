import React, { useEffect } from 'react';
import { GeminiIcon } from './Icons';

interface ApiKeyInputProps {
    onSubmit: (apiKey: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSubmit }) => {
    // Production API key - automatically set without user input
    const PRODUCTION_API_KEY = 'AIzaSyDK8wvR-FHcSm-Hh_AChY1DcU8aHc4f_20';

    useEffect(() => {
        // Automatically submit the API key when component mounts
        console.log('🚀 Production mode: Auto-initializing with API key...');
        
        // Small delay to show loading state briefly
        const timer = setTimeout(() => {
            onSubmit(PRODUCTION_API_KEY);
        }, 500);

        return () => clearTimeout(timer);
    }, [onSubmit]);

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-sidebar-dark">
            <div className="w-full max-w-md bg-sidebar-gray p-8 rounded-lg shadow-lg text-white">
                <div className="flex flex-col items-center mb-6">
                    <GeminiIcon className="w-12 h-12 mb-4 animate-pulse" />
                    <h1 className="text-2xl font-bold text-center">AI</h1>
                    <p className="text-gray-400 text-center mt-2">
                        Initializing your AI assistant...
                    </p>
                </div>
                
                {/* Loading indicator */}
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
                
                <div className="text-center">
                    <div className="bg-green-900/30 border border-green-600 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-center text-green-400 text-sm">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Production Ready
                        </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center">
                        Ready for instant AI conversations with sportsTech ChatBot.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyInput;