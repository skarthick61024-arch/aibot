import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

// Icon Components
const SendIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const StopIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
);

const ImageIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
    </svg>
);

const AttachIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
);

const CloseIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SparklesIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

interface ImagePart {
    mimeType: string;
    data: string;
}

interface MessageInputProps {
    onSendMessage: (message: string, image: ImagePart | null) => void;
    onGenerateImage: (prompt: string) => void;
    isGenerating: boolean;
    onStopGenerating: () => void;
    theme?: 'light' | 'dark';
}

export interface MessageInputRef {
    handleImageDrop: (file: File) => void;
    focusInput: () => void;
    clearInput: () => void;
    setInputValue: (value: string) => void;
}

const MessageInput = forwardRef<MessageInputRef, MessageInputProps>(({ 
    onSendMessage, 
    onGenerateImage,
    isGenerating, 
    onStopGenerating,
    theme = 'light'
}, ref) => {
    const [input, setInput] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showImageGen, setShowImageGen] = useState(false);
    const [imagePrompt, setImagePrompt] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px';
        }
    }, [input]);

    const handleImageChange = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageChange(file);
        }
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = () => {
        setImageFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    useImperativeHandle(ref, () => ({
        handleImageDrop: (file: File) => {
            handleImageChange(file);
        },
        focusInput: () => {
            textareaRef.current?.focus();
        },
        clearInput: () => {
            setInput('');
            removeImage();
        },
        setInputValue: (value: string) => {
            setInput(value);
        }
    }), []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && !imageFile) || isGenerating) {
            return;
        }

        if (imageFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                onSendMessage(input.trim(), { mimeType: imageFile.type, data: base64String });
                removeImage();
                setInput('');
            };
            reader.readAsDataURL(imageFile);
        } else {
            onSendMessage(input.trim(), null);
            setInput('');
        }
    };

    const handleGenerateImage = () => {
        if (imagePrompt.trim()) {
            onGenerateImage(imagePrompt.trim());
            setImagePrompt('');
            setShowImageGen(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="w-full border-t" style={{
            borderColor: theme === 'dark' ? 'rgb(55, 65, 81)' : 'rgb(229, 231, 235)'
        }}>
            <style>{`
                /* Prevent mobile zoom on input focus */
                @media screen and (max-width: 768px) {
                    .mobile-input-fix {
                        font-size: 16px !important;
                    }
                }
                
                /* Smooth scrolling for textarea */
                .mobile-input-fix {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                }
                
                /* Prevent text size adjustment on iOS */
                .mobile-input-fix {
                    -webkit-text-size-adjust: 100%;
                    -moz-text-size-adjust: 100%;
                    -ms-text-size-adjust: 100%;
                    text-size-adjust: 100%;
                }
            `}</style>

            <div className="max-w-4xl mx-auto px-4 py-4">
                {/* Image Generation Modal */}
                {showImageGen && (
                    <div className="mb-3">
                        <div className={`rounded-lg border p-4 ${
                            theme === 'dark' 
                                ? 'bg-gray-800 border-gray-700' 
                                : 'bg-white border-gray-200'
                        }`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <SparklesIcon className={`w-5 h-5 ${
                                        theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                    }`} />
                                    <span className={`font-medium ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>
                                        Generate Image
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowImageGen(false)}
                                    className={`p-1 rounded hover:bg-opacity-10 hover:bg-gray-500 ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                    }`}
                                >
                                    <CloseIcon />
                                </button>
                            </div>
                            
                            <textarea
                                value={imagePrompt}
                                onChange={(e) => setImagePrompt(e.target.value)}
                                placeholder="Describe the image you want to generate..."
                                className={`mobile-input-fix w-full p-3 rounded border resize-none mb-3 text-base ${
                                    theme === 'dark' 
                                        ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' 
                                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                rows={3}
                                autoFocus
                            />
                            
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowImageGen(false)}
                                    className={`px-4 py-2 rounded text-sm font-medium ${
                                        theme === 'dark' 
                                            ? 'text-gray-300 hover:bg-gray-700' 
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleGenerateImage}
                                    disabled={!imagePrompt.trim() || isGenerating}
                                    className={`px-4 py-2 rounded text-sm font-medium text-white disabled:opacity-50 ${
                                        theme === 'dark'
                                            ? 'bg-blue-600 hover:bg-blue-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    Generate
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Image Preview */}
                {previewUrl && (
                    <div className="mb-3">
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded border ${
                            theme === 'dark' 
                                ? 'bg-gray-800 border-gray-700' 
                                : 'bg-gray-50 border-gray-200'
                        }`}>
                            <img 
                                src={previewUrl} 
                                alt="Preview" 
                                className="h-14 w-14 rounded object-cover" 
                            />
                            <span className={`text-sm ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                                Image attached
                            </span>
                            <button
                                onClick={removeImage}
                                className={`ml-2 p-1 rounded hover:bg-opacity-10 hover:bg-gray-500 ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}
                            >
                                <CloseIcon />
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Input Box */}
                <div className={`flex items-end gap-2 p-2 rounded-lg border ${
                    theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white border-gray-300'
                }`}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                        accept="image/*"
                        className="hidden"
                    />
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 pb-1 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isGenerating}
                            className={`p-2 rounded hover:bg-opacity-10 hover:bg-gray-500 disabled:opacity-50 transition-colors ${
                                theme === 'dark' 
                                    ? 'text-gray-400 hover:text-gray-300' 
                                    : 'text-gray-600 hover:text-gray-700'
                            }`}
                            title="Attach image"
                        >
                            <AttachIcon className="w-5 h-5" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowImageGen(true)}
                            disabled={isGenerating}
                            className={`p-2 rounded hover:bg-opacity-10 hover:bg-gray-500 disabled:opacity-50 transition-colors ${
                                theme === 'dark' 
                                    ? 'text-gray-400 hover:text-gray-300' 
                                    : 'text-gray-600 hover:text-gray-700'
                            }`}
                            title="Generate image"
                        >
                            <SparklesIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Text Input */}
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        rows={1}
                        disabled={isGenerating}
                        style={{ fontSize: '16px' }}
                        className={`mobile-input-fix flex-1 bg-transparent resize-none outline-none px-1 py-1 leading-6 ${
                            theme === 'dark' 
                                ? 'text-white placeholder-gray-500' 
                                : 'text-gray-900 placeholder-gray-400'
                        } ${isGenerating ? 'opacity-50' : ''}`}
                    />
                    
                    {/* Send/Stop Button */}
                    <div className="pb-1 flex-shrink-0">
                        {isGenerating ? (
                            <button
                                type="button"
                                onClick={onStopGenerating}
                                className={`p-2 rounded transition-colors ${
                                    theme === 'dark' 
                                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                                title="Stop"
                            >
                                <StopIcon className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!input.trim() && !imageFile}
                                className={`p-2 rounded transition-all ${
                                    (input.trim() || imageFile)
                                        ? theme === 'dark' 
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : theme === 'dark'
                                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                                title="Send"
                            >
                                <SendIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Helper Text */}
                <div className={`mt-2 text-xs text-center ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                    Press Enter to send, Shift+Enter for new line
                </div>
            </div>
        </div>
    );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;