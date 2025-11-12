import React, { useRef, useEffect, useState } from 'react';
import { ChatSession, ImagePart } from '../types';
import MessageBubble from './MessageBubble';
import MessageInput, { MessageInputRef } from './MessageInput';
import { AnimatedHamburgerIcon } from './Icons';

interface ChatWindowProps {
    session: ChatSession;
    onSendMessage: (message: string, image: ImagePart | null) => void;
    onGenerateImage: (prompt: string) => void;
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
    isGenerating: boolean;
    onStopGenerating: () => void;
    onRetry: (sessionId: string) => void;
    theme?: 'light' | 'dark';
}

const ChatWindow: React.FC<ChatWindowProps> = ({
    session,
    onSendMessage,
    onGenerateImage,
    toggleSidebar,
    isSidebarOpen,
    isGenerating,
    onStopGenerating,
    onRetry,
    theme = 'light',
}) => {
    const { messages, title: sessionTitle, id: sessionId } = session;
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<MessageInputRef>(null);
    
    const [isUserAtBottom, setIsUserAtBottom] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const previousMessageCountRef = useRef(messages.length);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    const checkIfUserAtBottom = () => {
        if (chatContainerRef.current) {
            const container = chatContainerRef.current;
            const threshold = 150;
            const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
            setIsUserAtBottom(isAtBottom);
            setShowScrollButton(!isAtBottom && messages.length > 0);
        }
    };

    const handleScroll = () => {
        checkIfUserAtBottom();
    };

    // Global drag and drop
    useEffect(() => {
        const handleGlobalDragEnter = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
                for (const item of e.dataTransfer.items) {
                    if (item.type.startsWith('image/')) {
                        setIsDragging(true);
                        break;
                    }
                }
            }
        };

        const handleGlobalDragOver = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleGlobalDragLeave = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (!e.relatedTarget) {
                setIsDragging(false);
            }
        };

        const handleGlobalDrop = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    messageInputRef.current?.handleImageDrop(file);
                }
            }
        };

        document.addEventListener('dragenter', handleGlobalDragEnter);
        document.addEventListener('dragover', handleGlobalDragOver);
        document.addEventListener('dragleave', handleGlobalDragLeave);
        document.addEventListener('drop', handleGlobalDrop);

        return () => {
            document.removeEventListener('dragenter', handleGlobalDragEnter);
            document.removeEventListener('dragover', handleGlobalDragOver);
            document.removeEventListener('dragleave', handleGlobalDragLeave);
            document.removeEventListener('drop', handleGlobalDrop);
        };
    }, []);

    // Smart auto-scroll
    useEffect(() => {
        const currentMessageCount = messages.length;
        const previousMessageCount = previousMessageCountRef.current;
        
        if (currentMessageCount > previousMessageCount) {
            const lastMessage = messages[messages.length - 1];
            
            if (lastMessage?.sender === 'user') {
                setTimeout(() => scrollToBottom('smooth'), 100);
            } else if (lastMessage?.sender === 'ai' && isUserAtBottom) {
                setTimeout(() => scrollToBottom('smooth'), 100);
            }
        }
        
        previousMessageCountRef.current = currentMessageCount;
    }, [messages, isUserAtBottom]);

    useEffect(() => {
        scrollToBottom('auto');
    }, []);

    const handleSendMessage = (message: string, image: ImagePart | null) => {
        onSendMessage(message, image);
    };

    const handleGenerateImage = (prompt: string) => {
        onGenerateImage(prompt);
    };

    return (
        <div className={`flex flex-col h-screen w-full relative ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        }`}>
            <style>{`
                @keyframes slideInFromBottom {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes slideInFromTop {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                .animate-slide-in-bottom {
                    animation: slideInFromBottom 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }

                .animate-scale-in {
                    animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .animate-slide-in-top {
                    animation: slideInFromTop 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .animate-bounce-gentle {
                    animation: bounce 2s ease-in-out infinite;
                }

                .message-enter {
                    animation: slideInFromBottom 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* Custom scrollbar */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
                    border-radius: 4px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
                }

                /* Smooth transitions */
                * {
                    transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;
                }
            `}</style>

            {/* Drag Overlay with Animation */}
            {isDragging && (
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none animate-fade-in">
                    <div className={`absolute inset-0 ${
                        theme === 'dark' 
                            ? 'bg-gray-800/95' 
                            : 'bg-gray-100/95'
                    } backdrop-blur-md transition-all duration-300`}>
                        <div className="flex items-center justify-center h-full">
                            <div className={`text-center p-8 rounded-2xl border-2 border-dashed transition-all duration-300 transform hover:scale-105 animate-scale-in ${
                                theme === 'dark'
                                    ? 'border-blue-500 bg-gray-800 text-blue-400 shadow-2xl shadow-blue-500/20'
                                    : 'border-blue-500 bg-white text-blue-600 shadow-2xl shadow-blue-500/20'
                            }`}>
                                <svg className="w-16 h-16 mx-auto mb-4 animate-bounce-gentle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-xl font-semibold mb-1">Drop your image here</p>
                                <p className="text-sm opacity-75">Release to attach</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header with Animation */}
            <header className={`flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 sticky top-0 z-10 backdrop-blur-lg transition-all duration-300 ${
                theme === 'dark' 
                    ? 'bg-gray-900/95 border-b border-gray-800' 
                    : 'bg-white/95 border-b border-gray-200'
            }`}>
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <button 
                        onClick={toggleSidebar} 
                        className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                            theme === 'dark'
                                ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                        }`}
                        aria-label="Toggle sidebar"
                    >
                        <AnimatedHamburgerIcon className="w-5 h-5" isOpen={isSidebarOpen} />
                    </button>
                    
                    <h2 className={`text-sm sm:text-base font-medium truncate ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                        {sessionTitle}
                    </h2>
                </div>

                {/* Optional: Model indicator */}
                <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                    theme === 'dark'
                        ? 'bg-gray-800 text-gray-300'
                        : 'bg-gray-100 text-gray-700'
                }`}>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>AI</span>
                </div>
            </header>
            
            {/* Messages Area with Custom Scrollbar */}
            <main 
                ref={chatContainerRef}
                className={`flex-1 overflow-y-auto custom-scrollbar ${
                    theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                }`}
                onScroll={handleScroll}
            >
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full p-4 animate-fade-in">
                        <div className="text-center max-w-md mx-auto">
                            <div className={`mb-6 ${
                                theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
                            }`}>
                                <svg className="w-20 h-20 mx-auto animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className={`text-xl font-medium mb-2 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                How can I help you today?
                            </p>
                            <p className={`text-sm ${
                                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                                Start a conversation or upload an image
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="pb-4">
                        {messages.map((msg, index) => (
                            <div 
                                key={`message-${index}`}
                                className="message-enter"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <MessageBubble
                                    message={msg}
                                    onRetry={msg.isError ? () => onRetry(sessionId) : undefined}
                                    theme={theme}
                                />
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </main>

            {/* Scroll to Bottom Button */}
            {showScrollButton && (
                <button
                    onClick={() => scrollToBottom('smooth')}
                    className={`absolute bottom-24 sm:bottom-28 right-4 sm:right-8 p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 z-20 animate-slide-in-bottom ${
                        theme === 'dark'
                            ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                            : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                    aria-label="Scroll to bottom"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </button>
            )}
            
            {/* Input Area with Animation */}
            <footer className={`transition-all duration-300 ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            }`}>
                <MessageInput
                    ref={messageInputRef}
                    onSendMessage={handleSendMessage}
                    onGenerateImage={handleGenerateImage}
                    isGenerating={isGenerating}
                    onStopGenerating={onStopGenerating}
                    theme={theme}
                />
            </footer>
        </div>
    );
};

export default ChatWindow;