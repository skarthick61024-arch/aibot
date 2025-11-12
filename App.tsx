import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI, Chat, Content } from '@google/genai';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ApiKeyInput from './components/ApiKeyInput';
import WelcomeScreen from './components/WelcomeScreen';
import { ChatSession, Message, ImagePart, GeneratedImage } from './types';
import { throttle } from 'lodash-es';

// Free Image Generation Service
class ImageGenerationService {
    async generateImage(prompt: string): Promise<GeneratedImage> {
        try {
            const enhancedPrompt = `${prompt}, professional, high quality, detailed, photorealistic`;
            const encodedPrompt = encodeURIComponent(enhancedPrompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
            
            return {
                url: imageUrl,
                prompt: prompt,
                model: 'Pollinations AI'
            };
        } catch (error) {
            throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

// Error Display Component
const ErrorBanner: React.FC<{ 
    error: string; 
    onDismiss: () => void; 
    onChangeKey: () => void;
    theme: 'light' | 'dark';
}> = ({ error, onDismiss, onChangeKey, theme }) => (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4 ${
        theme === 'dark' ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'
    } border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start gap-3">
            <svg className={`w-6 h-6 flex-shrink-0 ${
                theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${
                    theme === 'dark' ? 'text-red-200' : 'text-red-800'
                }`}>
                    API Quota Exceeded
                </h3>
                <p className={`text-sm mb-3 ${
                    theme === 'dark' ? 'text-red-300' : 'text-red-700'
                }`}>
                    {error}
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={onChangeKey}
                        className={`px-3 py-1.5 text-sm rounded ${
                            theme === 'dark'
                                ? 'bg-red-700 hover:bg-red-600 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                    >
                        Change API Key
                    </button>
                    <button
                        onClick={onDismiss}
                        className={`px-3 py-1.5 text-sm rounded ${
                            theme === 'dark'
                                ? 'bg-red-800 hover:bg-red-700 text-red-200'
                                : 'bg-white hover:bg-gray-100 text-red-700 border border-red-300'
                        }`}
                    >
                        Dismiss
                    </button>
                </div>
            </div>
            <button
                onClick={onDismiss}
                className={`${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    </div>
);

function App() {
    const [geminiApiKey, setGeminiApiKey] = useState<string | null>(() => {
        const envKey = process.env.REACT_APP_GEMINI_API_KEY;
        if (envKey && envKey.trim() && envKey !== 'undefined') {
            return envKey.trim();
        }
        
        const storedKey = localStorage.getItem('gemini-api-key');
        if (storedKey && storedKey.trim()) {
            return storedKey.trim();
        }
        
        return null;
    });
    
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const stopGenerationRef = useRef(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [imageGenService] = useState(() => new ImageGenerationService());
    const [apiError, setApiError] = useState<string | null>(null);
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);

    // Theme management
    useEffect(() => {
        const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark';
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    const handleThemeChange = (newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
    };

    // Clear API key and reset
    const handleChangeApiKey = () => {
        localStorage.removeItem('gemini-api-key');
        setGeminiApiKey(null);
        setAi(null);
        setSessions([]);
        setActiveSessionId(null);
        setApiError(null);
        setShowApiKeyInput(true);
    };

    // AI initialization
    useEffect(() => {
        if (!geminiApiKey) {
            return;
        }

        console.log('Initializing AI...');
        let genAI: GoogleGenAI;
        try {
            genAI = new GoogleGenAI({ apiKey: geminiApiKey });
            setAi(genAI);
            console.log('AI initialized');
            setApiError(null);
        } catch (error) {
            console.error("Failed to initialize AI:", error);
            setApiError("Invalid API Key");
            handleChangeApiKey();
            return;
        }

        // Load stored sessions
        try {
            const storedSessions = localStorage.getItem('chat-sessions');
            if (storedSessions) {
                const parsedSessions: Omit<ChatSession, 'chat'>[] = JSON.parse(storedSessions);
                
                const initializedSessions = parsedSessions.map(session => {
                    const chat = genAI.chats.create({
                        model: 'gemini-2.5-flash', // Changed to stable model with better quota
                        history: session.messages
                            .filter(m => !m.isError && !m.isImageGeneration)
                            .map(m => {
                                const content: Content = {
                                    role: m.sender === 'user' ? 'user' : 'model',
                                    parts: m.text ? [{ text: m.text }] : [],
                                };
                                if (m.sender === 'user' && m.image) {
                                    content.parts.unshift({
                                        inlineData: {
                                            mimeType: m.image.mimeType,
                                            data: m.image.data,
                                        }
                                    });
                                }
                                return content;
                            }),
                    });
                    return { ...session, chat };
                });

                setSessions(initializedSessions);
                if (initializedSessions.length > 0) {
                    setActiveSessionId(initializedSessions[0].id);
                }
            }
        } catch (error) {
            console.error("Failed to parse sessions", error);
            localStorage.removeItem('chat-sessions');
        }
    }, [geminiApiKey]);

    // Save sessions
    useEffect(() => {
        if (sessions.length === 0) return;
        
        const sessionsToStore = sessions.map(({ chat, ...rest }) => rest);
        localStorage.setItem('chat-sessions', JSON.stringify(sessionsToStore));
    }, [sessions]);

    const handleSetApiKey = (key: string) => {
        if (!key || !key.trim()) {
            alert('Please enter a valid API key');
            return;
        }
        
        localStorage.setItem('gemini-api-key', key.trim());
        setGeminiApiKey(key.trim());
        setShowApiKeyInput(false);
        window.location.reload(); 
    };
    
    const handleNewChat = () => {
        if (!ai) return;
        
        const newChatInstance = ai.chats.create({ model: 'gemini-2.5-flash' });
        const newSession: ChatSession = {
            id: `session-${Date.now()}`,
            title: 'New Chat',
            messages: [],
            chat: newChatInstance,
        };
        
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        
        if (isSidebarOpen && window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    const handleSelectSession = (id: string) => {
        setActiveSessionId(id);
        if (isSidebarOpen && window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    const handleDeleteSession = (id: string) => {
        setSessions(prevSessions => {
            const newSessions = prevSessions.filter(s => s.id !== id);
            if (activeSessionId === id) {
                setActiveSessionId(newSessions.length > 0 ? newSessions[0].id : null);
            }
            return newSessions;
        });
    };
    
    const handleStopGenerating = () => {
        stopGenerationRef.current = true;
    };

    // Image Generation
    const handleGenerateImage = async (prompt: string) => {
        if (!activeSessionId) return;

        const userMessage: Message = { 
            sender: 'user', 
            text: `Generate image: ${prompt}`,
            isImageGeneration: true 
        };
        
        const loadingMessage: Message = { 
            sender: 'ai', 
            text: 'Generating your image...', 
            isLoading: true,
            isImageGeneration: true
        };

        setSessions(prev =>
            prev.map(s =>
                s.id === activeSessionId
                    ? { ...s, messages: [...s.messages, userMessage, loadingMessage] }
                    : s
            )
        );

        try {
            const generatedImage = await imageGenService.generateImage(prompt);
            
            const aiMessage: Message = {
                sender: 'ai',
                text: `Here's your generated image.`,
                generatedImage: generatedImage,
                isImageGeneration: true,
                isLoading: false
            };

            setSessions(prev =>
                prev.map(s => {
                    if (s.id === activeSessionId) {
                        const newMessages = [...s.messages];
                        newMessages[newMessages.length - 1] = aiMessage;
                        return { ...s, messages: newMessages };
                    }
                    return s;
                })
            );

            const currentSession = sessions.find(s => s.id === activeSessionId);
            if (currentSession && currentSession.title === 'New Chat') {
                setSessions(prev =>
                    prev.map(s => (s.id === activeSessionId ? { ...s, title: prompt.substring(0, 30) } : s))
                );
            }

        } catch (error) {
            const errorMessage: Message = {
                sender: 'ai',
                text: `Failed to generate image. ${error instanceof Error ? error.message : 'Please try again.'}`,
                isError: true,
                isImageGeneration: true,
                isLoading: false
            };

            setSessions(prev =>
                prev.map(s => {
                    if (s.id === activeSessionId) {
                        const newMessages = [...s.messages];
                        newMessages[newMessages.length - 1] = errorMessage;
                        return { ...s, messages: newMessages };
                    }
                    return s;
                })
            );
        }
    };

    // Message streaming with better error handling
    const _performSendMessageStream = async (sessionId: string, userMessage: Message, isRetry: boolean = false) => {
        const activeSession = sessions.find(s => s.id === sessionId);
        if (!activeSession || !activeSession.chat) return;

        stopGenerationRef.current = false;
        setIsGenerating(true);

        try {
            const parts: (string | { inlineData: { mimeType: string; data: string; } })[] = [];
            if (userMessage.image) {
                parts.push({
                    inlineData: {
                        mimeType: userMessage.image.mimeType,
                        data: userMessage.image.data,
                    }
                });
            }
            if (userMessage.text) {
                parts.push(userMessage.text);
            }

            const stream = await activeSession.chat.sendMessageStream({
                message: parts,
                config: {
                    tools: [{ googleSearch: {} }]
                }
            });
            
            let fullText = "";
            let chunkBuffer = "";

            const throttledUpdate = throttle(() => {
                if (chunkBuffer) {
                    fullText += chunkBuffer;
                    chunkBuffer = "";
                    
                    setSessions(prev =>
                        prev.map(s => {
                            if (s.id === sessionId) {
                                const newMessages = [...s.messages];
                                const lastMessage = newMessages[newMessages.length - 1];
                                if (lastMessage?.sender === 'ai') {
                                    lastMessage.text = fullText;
                                    lastMessage.isLoading = true;
                                }
                                return { ...s, messages: newMessages };
                            }
                            return s;
                        })
                    );
                }
            }, 100, { leading: true, trailing: true });

            for await (const chunk of stream) {
                if (stopGenerationRef.current) {
                    throttledUpdate.cancel();
                    break;
                }
                chunkBuffer += chunk.text;
                throttledUpdate();
            }
            
            throttledUpdate.flush();
            
            setSessions(prev =>
                prev.map(s => {
                    if (s.id === sessionId) {
                        const finalMessages = [...s.messages];
                        const lastMessage = finalMessages[finalMessages.length - 1];

                        if (lastMessage?.sender === 'ai') {
                            lastMessage.text = fullText;
                            lastMessage.isLoading = false;
                        }

                        if (s.title === 'New Chat' && fullText) {
                            generateTitle(s, fullText);
                        }
                        
                        return { ...s, messages: finalMessages };
                    }
                    return s;
                })
            );

        } catch (error: any) {
            console.error("Error sending message:", error);
            
            // Check for quota error
            if (error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
                setApiError('Your API key has exceeded its quota limit. Please wait a few minutes or use a different API key.');
            }
            
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
            
            setSessions(prev =>
                prev.map(s => {
                    if (s.id === sessionId) {
                        const errorMessages = [...s.messages];
                        const lastMessage = errorMessages[errorMessages.length - 1];
                        if (lastMessage?.sender === 'ai') {
                            lastMessage.text = errorMessage.includes('quota') 
                                ? 'API quota exceeded. Please try again in a few minutes or change your API key.'
                                : `Sorry, something went wrong. ${errorMessage}`;
                            lastMessage.isLoading = false;
                            lastMessage.isError = true;
                        }
                        return { ...s, messages: errorMessages };
                    }
                    return s;
                })
            );
        } finally {
            setIsGenerating(false);
            stopGenerationRef.current = false;
        }
    };

    const handleSendMessage = async (message: string, image: ImagePart | null) => {
        if (!activeSessionId) return;
        
        const userMessage: Message = { sender: 'user', text: message, image };
        const loadingMessage: Message = { sender: 'ai', text: '', isLoading: true };

        setSessions(prev =>
            prev.map(s =>
                s.id === activeSessionId
                    ? { ...s, messages: [...s.messages, userMessage, loadingMessage] }
                    : s
            )
        );
        
        await _performSendMessageStream(activeSessionId, userMessage);
    };

    const handleRetry = (sessionId: string) => {
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;
    
        const lastUserMessage = [...session.messages].reverse().find(m => m.sender === 'user');
        if (!lastUserMessage) return;
    
        const messagesWithoutError = session.messages.filter(m => !m.isError);
        const loadingMessage: Message = { sender: 'ai', text: '', isLoading: true };

        setSessions(prev =>
            prev.map(s =>
                s.id === sessionId
                    ? { ...s, messages: [...messagesWithoutError, loadingMessage] }
                    : s
            )
        );
    
        _performSendMessageStream(sessionId, lastUserMessage, true);
    };
    
    const generateTitle = async (session: ChatSession, responseText: string) => {
        if (!ai) return;
        
        const userMessage = session.messages.find(m => m.sender === 'user');
        if (!userMessage) return;

        try {
            const titlePrompt = `Create a short title (max 4 words) for this chat. No quotes:\n\nUser: "${userMessage.text}"\n\nTitle:`;
            
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: titlePrompt,
            });

            const newTitle = result.text.trim().replace(/['"]/g, '').substring(0, 40);
            
            setSessions(prev =>
                prev.map(s => (s.id === session.id ? { ...s, title: newTitle } : s))
            );
        } catch (error) {
            const fallbackTitle = userMessage.text.substring(0, 30) + (userMessage.text.length > 30 ? '...' : '');
            setSessions(prev =>
                prev.map(s => (s.id === session.id ? { ...s, title: fallbackTitle } : s))
            );
        }
    };

    const activeSession = useMemo(() => 
        sessions.find(s => s.id === activeSessionId), 
        [sessions, activeSessionId]
    );
    
    if (!geminiApiKey || showApiKeyInput) {
        return <ApiKeyInput onSubmit={handleSetApiKey} />;
    }

    return (
        <div className={`flex h-screen w-screen overflow-hidden ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        }`}>
            {/* Error Banner */}
            {apiError && (
                <ErrorBanner 
                    error={apiError} 
                    onDismiss={() => setApiError(null)}
                    onChangeKey={handleChangeApiKey}
                    theme={theme}
                />
            )}

            <Sidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onNewChat={handleNewChat}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
                isOpen={isSidebarOpen}
                theme={theme}
                onThemeChange={handleThemeChange}
            />
            
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {activeSession ? (
                    <ChatWindow
                        session={activeSession}
                        onSendMessage={handleSendMessage}
                        onGenerateImage={handleGenerateImage}
                        toggleSidebar={() => setSidebarOpen(prev => !prev)}
                        isSidebarOpen={isSidebarOpen}
                        isGenerating={isGenerating}
                        onStopGenerating={handleStopGenerating}
                        onRetry={handleRetry}
                        theme={theme}
                    />
                ) : (
                    <WelcomeScreen 
                        onNewChat={handleNewChat} 
                        toggleSidebar={() => setSidebarOpen(prev => !prev)} 
                        isSidebarOpen={isSidebarOpen}
                        theme={theme}
                    />
                )}
            </main>
        </div>
    );
}

export default App;