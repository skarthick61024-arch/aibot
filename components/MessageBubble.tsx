import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Simple Icon Components
const UserIcon = React.memo(({ className = "w-8 h-8" }: { className?: string }) => (
  <div className={`${className} rounded-sm bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg`}>
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  </div>
));

const AiIcon = React.memo(({ className = "w-8 h-8", theme = 'light' }: { className?: string; theme?: 'light' | 'dark' }) => (
  <div className={`${className} rounded-sm ${
    theme === 'dark' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gradient-to-br from-blue-400 to-cyan-400'
  } flex items-center justify-center text-white shadow-lg`}>
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  </div>
));

const CopyIcon = React.memo(({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
));

const CheckIcon = React.memo(({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
));

const DownloadIcon = React.memo(({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
));

// Custom hooks
const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isDarkMode;
};

const useClipboard = (text: string) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [text]);

  return { isCopied, copy };
};

// Interfaces
interface ImagePart {
  mimeType: string;
  data: string;
}

interface GeneratedImage {
  url: string;
  prompt: string;
  model: string;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  image?: ImagePart;
  generatedImage?: GeneratedImage;
  isError?: boolean;
  isLoading?: boolean;
  isImageGeneration?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  onRetry?: () => void;
  theme?: 'light' | 'dark';
}

// Loading Component
const LoadingDots = React.memo(({ theme }: { theme: 'light' | 'dark' }) => (
  <div className="flex gap-1 p-4">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full animate-bounce ${
          theme === 'dark' ? 'bg-gray-400' : 'bg-gray-500'
        }`}
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
));

// Image Display Component
const ImageDisplay = React.memo(({ 
  generatedImage, 
  theme 
}: { 
  generatedImage: GeneratedImage; 
  theme: 'light' | 'dark';
}) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleDownloadImage = useCallback(async () => {
    try {
      const link = document.createElement('a');
      
      if (generatedImage.url.startsWith('data:')) {
        link.href = generatedImage.url;
      } else {
        const response = await fetch(generatedImage.url);
        const blob = await response.blob();
        link.href = URL.createObjectURL(blob);
      }
      
      link.download = `ai-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (link.href.startsWith('blob:')) {
        URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      console.error('Failed to download:', error);
    }
  }, [generatedImage]);

  return (
    <div className="space-y-3">
      {/* Image Container */}
      <div className={`relative rounded-lg overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingDots theme={theme} />
          </div>
        )}
        
        {imageError ? (
          <div className={`flex items-center justify-center h-64 ${
            theme === 'dark' ? 'text-red-400' : 'text-red-500'
          }`}>
            Failed to load image
          </div>
        ) : (
          <img 
            src={generatedImage.url} 
            alt={generatedImage.prompt}
            className="w-full h-auto"
            onLoad={() => setIsImageLoading(false)}
            onError={() => {
              setIsImageLoading(false);
              setImageError(true);
            }}
            style={{ display: isImageLoading ? 'none' : 'block' }}
          />
        )}
      </div>
      
      {/* Prompt */}
      {!imageError && (
        <div className={`p-3 rounded-lg text-sm ${
          theme === 'dark' 
            ? 'bg-gray-700 text-white' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          <p className="font-medium mb-1">Prompt:</p>
          <p className={`text-xs ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-600'
          }`}>"{generatedImage.prompt}"</p>
        </div>
      )}
      
      {/* Download Button */}
      {!isImageLoading && !imageError && (
        <button
          onClick={handleDownloadImage}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
          }`}
        >
          <DownloadIcon />
          <span>Download</span>
        </button>
      )}
    </div>
  );
});

// Code Block Component
const CodeBlock = React.memo(({ node, className, children, theme, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const codeText = String(children).replace(/\n$/, '');
  const { isCopied, copy } = useClipboard(codeText);

  if (!match) {
    return (
      <code 
        className={`px-1.5 py-0.5 rounded text-sm font-mono ${
          theme === 'dark'
            ? 'bg-gray-700 text-white'
            : 'bg-gray-100 text-gray-800'
        }`} 
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className={`my-4 rounded-lg overflow-hidden ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      {/* Header */}
      <div className={`flex justify-between items-center px-4 py-2 text-xs ${
        theme === 'dark' 
          ? 'bg-gray-800 text-white' 
          : 'bg-gray-200 text-gray-600'
      }`}>
        <span className="font-mono">{match[1]}</span>
        <button 
          onClick={copy} 
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
            theme === 'dark'
              ? 'hover:bg-gray-700 text-white'
              : 'hover:bg-gray-300 text-gray-600'
          }`}
        >
          {isCopied ? (
            <>
              <CheckIcon className="w-3 h-3" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon className="w-3 h-3" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      
      {/* Code */}
      <SyntaxHighlighter
        style={theme === 'dark' ? oneDark : oneLight}
        language={match[1]}
        PreTag="div"
        className="text-sm"
        customStyle={{
          margin: 0,
          background: 'transparent',
          padding: '1rem'
        }}
        {...props}
      >
        {codeText}
      </SyntaxHighlighter>
    </div>
  );
});

// Main Component
const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onRetry, theme: propTheme }) => {
  const { sender, text, image, generatedImage, isError, isLoading } = message;
  const systemTheme = useTheme();
  const theme = propTheme || (systemTheme ? 'dark' : 'light');
  const { isCopied: isMessageCopied, copy: copyMessage } = useClipboard(text);

  const MemoizedCodeBlock = useMemo(
    () => (props: any) => <CodeBlock {...props} theme={theme} />,
    [theme]
  );

  const renderAiContent = useCallback(() => {
    if (isLoading && !text) {
      return <LoadingDots theme={theme} />;
    }
    
    if (isError) {
      return (
        <div className="space-y-3">
          <p className={`text-sm ${
            theme === 'dark' ? 'text-red-400' : 'text-red-500'
          }`}>{text}</p>
          {onRetry && (
            <button 
              onClick={onRetry} 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              Retry
            </button>
          )}
        </div>
      );
    }
    
    return (
      <div className={`prose max-w-none ${
        theme === 'dark' 
          ? '!text-white prose-headings:!text-white prose-p:!text-white prose-strong:!text-white prose-em:!text-white prose-code:!text-white prose-li:!text-white prose-a:!text-blue-400 prose-blockquote:!text-white prose-th:!text-white prose-td:!text-white prose-ul:!text-white prose-ol:!text-white' 
          : 'prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-gray-800 prose-li:text-gray-700'
      }`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{ code: MemoizedCodeBlock }}
        >
          {text || ''}
        </ReactMarkdown>
      </div>
    );
  }, [isLoading, text, isError, onRetry, theme, MemoizedCodeBlock]);

  return (
    <div className={`group py-6 px-4 ${
      sender === 'ai' 
        ? theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
        : theme === 'dark' ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-4 items-start">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {sender === 'user' ? (
              <UserIcon />
            ) : (
              <AiIcon theme={theme} />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Uploaded Image */}
            {image && (
              <div className="max-w-md">
                <img 
                  src={`data:${image.mimeType};base64,${image.data}`} 
                  alt="Upload" 
                  className="rounded-lg w-full"
                />
              </div>
            )}

            {/* Generated Image */}
            {generatedImage && (
              <ImageDisplay generatedImage={generatedImage} theme={theme} />
            )}

            {/* Text Content */}
            {sender === 'user' && text && (
              <div className={`whitespace-pre-wrap ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {text}
              </div>
            )}
            
            {sender === 'ai' && renderAiContent()}

            {/* Copy Button */}
            {sender === 'ai' && !isLoading && !isError && text && (
              <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={copyMessage}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700 text-white'
                      : 'hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {isMessageCopied ? (
                    <>
                      <CheckIcon className="w-3 h-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;