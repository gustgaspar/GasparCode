import React, { useState, useEffect, useRef } from 'react';
import { generateWebsiteStream, ImageAttachment } from './services/geminiService';
import { 
  Sparkles, 
  Code, 
  Eye, 
  RefreshCw,
  Monitor,
  Smartphone,
  Paperclip,
  ArrowUp,
  Settings,
  ChevronDown,
  X,
  Image as ImageIcon
} from './components/Icons';
import { ViewMode } from './types';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [viewportWidth, setViewportWidth] = useState('100%');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageAttachment | null>(null);
  
  const codeEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate type
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Por favor, selecione uma imagem PNG ou JPEG.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64Data = base64String.split(',')[1];
        
        setSelectedImage({
          mimeType: file.type,
          data: base64Data
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!prompt.trim() && !selectedImage) || isGenerating) return;

    const currentPrompt = prompt;
    const currentImage = selectedImage;

    setPrompt('');
    setSelectedImage(null); // Clear image after sending
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setHasStarted(true);
    setIsGenerating(true);
    
    // Add user message to history
    const userMessageText = currentImage 
      ? `[Imagem Anexada] ${currentPrompt}` 
      : currentPrompt;
      
    setMessages(prev => [...prev, { role: 'user', text: userMessageText }]);

    // Prepare temp code holder if it's not the first run
    let accumulatedCode = '';

    try {
      // If we already have code, we pass it to the service to update it
      // We pass the full message history so the AI knows the context
      
      // Reset generated code visual only if starting fresh, 
      // otherwise we might want to keep showing the old one until new chunks arrive? 
      // For "vibe" it's often cooler to see it rewrite. Let's clear it to show progress.
      setGeneratedCode(''); 

      await generateWebsiteStream(
        currentPrompt, 
        generatedCode, // Pass current code as context
        currentImage, 
        messages, // Pass history
        (chunk) => {
          accumulatedCode += chunk;
          setGeneratedCode(prev => prev + chunk);
      });
      
      // Add assistant response to history after completion
      // We don't save the whole code in history to save tokens, just a confirmation or summary
      // But for the prompt logic to work next time, we rely on `generatedCode` state + history text
      setMessages(prev => [...prev, { role: 'assistant', text: 'Site atualizado com sucesso.' }]);

    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-scroll code view
  useEffect(() => {
    if (showCode && codeEndRef.current) {
      codeEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [generatedCode, showCode]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleViewportChange = (width: string) => {
    setViewportWidth(width);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-blue-100 selection:text-blue-900">
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/png, image/jpeg"
        className="hidden"
      />

      {!hasStarted ? (
        // INITIAL HERO STATE
        <div className="flex-1 flex flex-col justify-center items-center p-6 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="w-full max-w-3xl flex flex-col items-center z-10 animate-fade-in">
            <div className="mb-6 flex items-center gap-2 bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/50 shadow-sm">
               <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">New</span>
               <span className="text-sm text-gray-600">Gustavo Gaspar 2.0</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-center mb-6 bg-gradient-to-b from-gray-900 to-gray-600 bg-clip-text text-transparent pb-2">
              Crie algo <span className="text-blue-600">Extraordinário</span>
            </h1>
            
            <p className="text-xl text-gray-500 mb-12 text-center max-w-xl leading-relaxed">
              Desenvolva interfaces e sites web conversando com IA. Simples, rápido e elegante. <br />
              Só mandar um prompt top aí meu sócio, Lufão!
            </p>

            <div className="w-full relative group">
              <form onSubmit={handleGenerate} className="relative w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-2 transition-all duration-300 focus-within:shadow-[0_8px_40px_rgb(0,113,227,0.15)] focus-within:border-blue-200">
                <div className="flex flex-col">
                  {selectedImage && (
                    <div className="mx-4 mt-2 mb-1 flex">
                      <div className="relative group">
                        <img 
                          src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} 
                          alt="Preview" 
                          className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                        />
                        <button 
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-0.5 shadow-md hover:bg-black transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    autoFocus
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Peça ao Gustavo para criar um site..."
                    className="w-full p-4 text-lg bg-transparent border-none outline-none placeholder-gray-400 text-gray-800"
                  />
                  
                  <div className="flex items-center justify-between px-4 pb-2 mt-2">
                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${selectedImage ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-50'}`}
                      >
                        <Paperclip size={18} />
                        <span className="hidden sm:inline">Anexar</span>
                      </button>
                      <button type="button" className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium">
                         <Settings size={18} />
                         <span className="hidden sm:inline">Configurar</span>
                      </button>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={(!prompt.trim() && !selectedImage)}
                      className="bg-[#1D1D1F] hover:bg-black text-white rounded-xl p-3 shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                    >
                      <ArrowUp size={20} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="mt-8 flex gap-3 flex-wrap justify-center">
              {['Portfolio Minimalista', 'Landing Page SaaS', 'Blog Pessoal'].map((suggestion) => (
                <button 
                  key={suggestion}
                  onClick={() => {
                    setPrompt(suggestion);
                    // Optional: auto-submit
                  }}
                  className="px-4 py-2 bg-white/60 hover:bg-white border border-gray-200/50 hover:border-blue-200 rounded-lg text-sm text-gray-600 transition-all shadow-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // ACTIVE SPLIT VIEW
        <div className="flex h-screen overflow-hidden">
          
          {/* LEFT SIDEBAR - CHAT */}
          <div className="w-[350px] md:w-[400px] flex flex-col border-r border-gray-200 bg-white/80 backdrop-blur-xl z-20 shadow-xl">
            {/* Sidebar Header */}
            <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 bg-white/50">
              <div 
                className="font-bold text-lg tracking-tight cursor-pointer flex items-center gap-2"
                onClick={() => window.location.reload()}
              >
                <div className="w-6 h-6 bg-black text-white rounded flex items-center justify-center text-xs">G</div>
                Gustavo Gaspar
              </div>
              <button className="text-gray-400 hover:text-black transition-colors">
                <Settings size={18} />
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
              {messages.map((msg, idx) => (
                <div key={idx} className={`animate-slide-up ${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
                  <div className={`
                    max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                    ${msg.role === 'user' 
                      ? 'bg-[#E8E8ED] text-[#1D1D1F]' 
                      : 'bg-transparent text-gray-600 border border-gray-100'}
                  `}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
               <form onSubmit={handleGenerate} className="relative bg-gray-50 rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  {selectedImage && (
                    <div className="p-2 pb-0 flex">
                      <div className="relative group">
                        <img 
                          src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} 
                          alt="Preview" 
                          className="h-12 w-12 object-cover rounded-md border border-gray-200"
                        />
                        <button 
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-1.5 -right-1.5 bg-gray-800 text-white rounded-full p-0.5 shadow-md hover:bg-black transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                  )}

                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                    placeholder="Faça uma alteração..."
                    className="w-full bg-transparent p-3 pr-10 min-h-[50px] max-h-[120px] resize-none outline-none text-sm text-gray-800 placeholder-gray-400 rounded-xl"
                  />
                  
                  <div className="absolute bottom-2 left-2">
                     <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-1.5 rounded-lg transition-colors ${selectedImage ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:bg-gray-200'}`}
                      >
                        <Paperclip size={16} />
                      </button>
                  </div>

                  <button 
                    type="submit"
                    disabled={isGenerating || (!prompt.trim() && !selectedImage)}
                    className={`absolute bottom-2 right-2 p-1.5 rounded-lg transition-all ${(prompt.trim() || selectedImage) ? 'bg-black text-white hover:scale-105' : 'bg-gray-200 text-gray-400'}`}
                  >
                    {isGenerating ? <RefreshCw size={14} className="animate-spin" /> : <ArrowUp size={16} />}
                  </button>
               </form>
            </div>
          </div>

          {/* RIGHT PANEL - PREVIEW */}
          <div className="flex-1 flex flex-col bg-[#F5F5F7] relative">
            
            {/* Preview Toolbar */}
            <div className="h-14 flex items-center justify-between px-6 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-lg">
                <button 
                  onClick={() => handleViewportChange('100%')}
                  className={`p-1.5 rounded-md transition-all ${viewportWidth === '100%' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Monitor size={16} />
                </button>
                <button 
                  onClick={() => handleViewportChange('375px')}
                  className={`p-1.5 rounded-md transition-all ${viewportWidth === '375px' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Smartphone size={16} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                 <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                   {isGenerating ? 'Generating...' : 'Live Preview'}
                 </span>
              </div>

              <button 
                onClick={() => setShowCode(!showCode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${showCode ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                title="Toggle Code View"
              >
                <Code size={16} />
                <span>Code</span>
              </button>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-hidden relative flex items-center justify-center p-6">
              {showCode ? (
                // CODE VIEW
                <div className="w-full h-full bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden border border-gray-700/50 flex flex-col animate-fade-in">
                  <div className="h-9 bg-[#252526] border-b border-[#333] flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                    </div>
                    <span className="ml-4 text-xs text-gray-400 font-mono">index.html</span>
                  </div>
                  <div className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed text-blue-100">
                    <pre className="whitespace-pre-wrap">{generatedCode}</pre>
                    <div ref={codeEndRef} />
                  </div>
                </div>
              ) : (
                // PREVIEW VIEW
                <div 
                  className="bg-white shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden"
                  style={{ 
                    width: viewportWidth, 
                    height: viewportWidth === '100%' ? '100%' : '850px',
                    maxHeight: '100%',
                    borderRadius: viewportWidth === '100%' ? '12px' : '40px',
                    border: viewportWidth === '100%' ? '1px solid rgba(0,0,0,0.1)' : '12px solid #1D1D1F'
                  }}
                >
                  <iframe
                    title="Preview"
                    srcDoc={generatedCode}
                    className="w-full h-full border-none bg-white"
                    sandbox="allow-scripts" 
                  />
                  {!generatedCode && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400">
                      <div className="flex flex-col items-center gap-4">
                         <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"></div>
                         <p>Waiting for magic...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default App;