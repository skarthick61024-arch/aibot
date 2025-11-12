import React from 'react';
import { AnimatedHamburgerIcon } from './Icons';

interface WelcomeScreenProps {
    onNewChat: () => void;
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
    theme?: 'light' | 'dark';
}

// Logo Component
const Logo: React.FC<{ 
    className?: string; 
    theme?: 'light' | 'dark';
}> = ({ 
    className = "h-12 w-12", 
    theme = 'light'
}) => {
    const logoSrc = theme === 'dark' 
         ? "/fav.png"      
         : "/fav.png";   

    return (
        <img 
             src={logoSrc}
            
            className={`${className} object-contain`}
        />
    );
};

// Example Prompt Card Component
const ExampleCard: React.FC<{ 
    text: string; 
    onClick: () => void;
    theme?: 'light' | 'dark';
}> = ({ text, onClick, theme = 'light' }) => {
    return (
        <button
            onClick={onClick}
            className={`p-4 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] ${
                theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700 text-gray-200'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700'
            }`}
        >
            <p className="text-sm font-medium">{text}</p>
        </button>
    );
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
    onNewChat, 
    toggleSidebar,
    theme = 'light'
}) => {
    // Example prompts
    const examples = [
        "Explain quantum computing in simple terms",
        "Got any creative ideas for a 10 year old's birthday?",
        "How do I make an HTTP request in JavaScript?",
        "What are some fun indoor activities?"
    ];

    const capabilities = [
        "Remembers what user said earlier in the conversation",
        "Allows user to provide follow-up corrections",
        "Trained to decline inappropriate requests"
    ];

    const limitations = [
        "May occasionally generate incorrect information",
        "May occasionally produce harmful instructions or biased content",
        "Limited knowledge of world and events after 2021"
    ];

    return (
        <div className={`flex flex-col h-screen w-full ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        }`}>
            {/* Minimal Header */}
            <header className={`flex items-center justify-between px-4 py-3 ${
                theme === 'dark' 
                    ? 'bg-gray-900' 
                    : 'bg-white'
            }`}>
                <button 
                    onClick={toggleSidebar} 
                    className={`p-2 rounded-md transition-colors ${
                        theme === 'dark'
                            ? 'hover:bg-gray-800 text-gray-400'
                            : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    aria-label="Toggle sidebar"
                >
                    <AnimatedHamburgerIcon className="w-5 h-5" />
                </button>

                <button
                    onClick={onNewChat}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        theme === 'dark'
                            ? 'bg-gray-800 hover:bg-gray-750 text-white border border-gray-700'
                            : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
                    }`}
                >
                    New chat
                </button>
            </header>
            
            {/* Main Content */}
            <div className={`flex-1 overflow-y-auto px-4 pb-8 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
                <div className="max-w-3xl mx-auto pt-12 md:pt-20">
                    {/* Logo and Title */}
                    <div className="flex flex-col items-center mb-8">
                        <Logo className="h-16 w-16 mb-4" theme={theme} />
                        <h1 className={`text-3xl md:text-4xl font-semibold mb-2 ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                            How can I help you today?
                        </h1>
                    </div>

                    {/* Example Prompts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
                        {examples.map((example, index) => (
                            <ExampleCard 
                                key={index}
                                text={example}
                                onClick={() => {
                                    onNewChat();
                                    // You can pass the example text to start the chat
                                }}
                                theme={theme}
                            />
                        ))}
                    </div>

                    {/* Features Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                        {/* Examples Column */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                                </svg>
                                <h3 className={`font-semibold ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Examples
                                </h3>
                            </div>
                            <ul className="space-y-2">
                                {examples.slice(0, 3).map((example, index) => (
                                    <li 
                                        key={index}
                                        className={`text-xs md:text-sm p-3 rounded-lg ${
                                            theme === 'dark'
                                                ? 'bg-gray-800 text-gray-300'
                                                : 'bg-gray-50 text-gray-600'
                                        }`}
                                    >
                                        "{example}"
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Capabilities Column */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 7H7v6h6V7z" />
                                    <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                                </svg>
                                <h3 className={`font-semibold ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Capabilities
                                </h3>
                            </div>
                            <ul className="space-y-2">
                                {capabilities.map((capability, index) => (
                                    <li 
                                        key={index}
                                        className={`text-xs md:text-sm p-3 rounded-lg ${
                                            theme === 'dark'
                                                ? 'bg-gray-800 text-gray-300'
                                                : 'bg-gray-50 text-gray-600'
                                        }`}
                                    >
                                        {capability}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Limitations Column */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <h3 className={`font-semibold ${
                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                    Limitations
                                </h3>
                            </div>
                            <ul className="space-y-2">
                                {limitations.map((limitation, index) => (
                                    <li 
                                        key={index}
                                        className={`text-xs md:text-sm p-3 rounded-lg ${
                                            theme === 'dark'
                                                ? 'bg-gray-800 text-gray-300'
                                                : 'bg-gray-50 text-gray-600'
                                        }`}
                                    >
                                        {limitation}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;