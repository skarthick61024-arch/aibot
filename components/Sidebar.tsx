import React, { useState } from 'react';
import { ChatSession } from '../types';
import { PlusIcon, ChatBubbleIcon, TrashIcon, SettingsIcon, SunIcon, MoonIcon } from './Icons';

interface SidebarProps {
    sessions: ChatSession[];
    activeSessionId: string | null;
    onNewChat: () => void;
    onSelectSession: (id: string) => void;
    onDeleteSession: (id: string) => void;
    isOpen: boolean;
    theme?: 'light' | 'dark';
    onThemeChange?: (theme: 'light' | 'dark') => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    sessions,
    activeSessionId,
    onNewChat,
    onSelectSession,
    onDeleteSession,
    isOpen,
    theme = 'light',
    onThemeChange,
}) => {
    const [showSettings, setShowSettings] = useState(false);

    const sidebarClasses = `
        flex flex-col h-screen flex-shrink-0
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-0'}
        ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}
        overflow-hidden
    `;

    const toggleSettings = () => {
        setShowSettings(!showSettings);
    };

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        onThemeChange?.(newTheme);
    };

    return (
        <aside id="sidebar-nav" className={sidebarClasses}>
            {/* New Chat Button */}
            <div className="p-2">
                <button
                    onClick={onNewChat}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all ${
                        theme === 'dark'
                            ? 'bg-gray-800 hover:bg-gray-750 text-white border border-gray-700'
                            : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-200 shadow-sm'
                    }`}
                >
                    <PlusIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">New chat</span>
                </button>
            </div>
            
            {/* Chat Sessions List */}
            <nav className="flex-1 overflow-y-auto px-2 pb-2">
                <div className="space-y-1">
                    {sessions.length > 0 ? (
                        sessions.map((session) => (
                            <div key={session.id} className="relative group">
                                <button
                                    onClick={() => onSelectSession(session.id)}
                                    className={`
                                        w-full flex items-center gap-3 p-3 rounded-lg text-sm
                                        transition-all relative group/item
                                        ${activeSessionId === session.id 
                                            ? theme === 'dark'
                                                ? 'bg-gray-800 text-white'
                                                : 'bg-gray-200 text-gray-900'
                                            : theme === 'dark'
                                                ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                                                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    <ChatBubbleIcon className="w-4 h-4 flex-shrink-0" />
                                    <span className="flex-1 truncate text-left" title={session.title}>
                                        {session.title}
                                    </span>
                                    
                                    {/* Delete Button - Shows on hover */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('Delete this chat?')) {
                                                onDeleteSession(session.id);
                                            }
                                        }}
                                        className={`
                                            p-1 rounded-md transition-all
                                            opacity-0 group-hover/item:opacity-100
                                            ${theme === 'dark'
                                                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                                                : 'hover:bg-gray-300 text-gray-500 hover:text-gray-900'
                                            }
                                        `}
                                        aria-label="Delete chat"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className={`text-center py-8 text-sm ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                            No conversations yet
                        </div>
                    )}
                </div>
            </nav>
            
            {/* Bottom Section - Settings */}
            <div className={`border-t p-2 ${
                theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
            }`}>
                {/* Settings Toggle Button */}
                <button
                    onClick={toggleSettings}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all ${
                        showSettings
                            ? theme === 'dark'
                                ? 'bg-gray-800 text-white'
                                : 'bg-gray-200 text-gray-900'
                            : theme === 'dark'
                                ? 'hover:bg-gray-800 text-gray-300'
                                : 'hover:bg-gray-200 text-gray-600'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <SettingsIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate font-medium">Settings</span>
                    </div>
                    <svg 
                        className={`w-4 h-4 transform transition-transform ${showSettings ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Settings Panel with Theme Toggle */}
                {showSettings && (
                    <div className={`mt-2 rounded-lg p-3 ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                        <div className="space-y-2">
                            <h4 className={`text-xs font-semibold mb-3 ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                                Appearance
                            </h4>
                            
                            {/* Light Theme Button */}
                            <button
                                onClick={() => handleThemeChange('light')}
                                className={`
                                    w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium
                                    transition-all
                                    ${theme === 'light' 
                                        ? 'bg-blue-600 text-white shadow-sm' 
                                        : theme === 'dark'
                                            ? 'hover:bg-gray-750 text-gray-300'
                                            : 'hover:bg-gray-200 text-gray-700'
                                    }
                                `}
                            >
                                <SunIcon className="w-4 h-4 flex-shrink-0" />
                                <span className="flex-1 text-left">Light</span>
                                {theme === 'light' && (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                            
                            {/* Dark Theme Button */}
                            <button
                                onClick={() => handleThemeChange('dark')}
                                className={`
                                    w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium
                                    transition-all
                                    ${theme === 'dark' 
                                        ? 'bg-blue-600 text-white shadow-sm' 
                                        : 'hover:bg-gray-200 text-gray-700'
                                    }
                                `}
                            >
                                <MoonIcon className="w-4 h-4 flex-shrink-0" />
                                <span className="flex-1 text-left">Dark</span>
                                {theme === 'dark' && (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Additional Settings Options (Optional) */}
                        <div className={`mt-4 pt-4 border-t ${
                            theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
                        }`}>
                            <button
                                className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-all ${
                                    theme === 'dark'
                                        ? 'hover:bg-gray-750 text-gray-300'
                                        : 'hover:bg-gray-200 text-gray-700'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="flex-1 text-left">About</span>
                            </button>
                            
                            <button
                                className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-medium transition-all mt-1 ${
                                    theme === 'dark'
                                        ? 'hover:bg-gray-750 text-gray-300'
                                        : 'hover:bg-gray-200 text-gray-700'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="flex-1 text-left">Sign out</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;