
      <div className="relative">
        <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 p-6 w-[350px]">

          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={() => setShowChat(s => !s)} className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
            </button>
            <button onClick={() => setIsMuted(m => !m)} className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors">
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
            <button onClick={toggleMinimize} className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors">
              <Minimize2 className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

          <div className="flex justify-center mb-4 mt-8">
            <div className="relative">
              <canvas ref={canvasRef} className="rounded-full" />

              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-800 rounded-full border border-cyan-500/30 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : isThinking ? 'bg-yellow-500 animate-pulse' : isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-cyan-500'}`} />
                <span className="text-xs text-cyan-400">{isListening ? 'استماع...' : isThinking ? 'تفكير...' : isSpeaking ? 'تحدث...' : 'جاهز'}</span>
              </div>
            </div>
          </div>

          {transcript && (
            <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <div className="text-xs text-cyan-400 mb-1">أنت قلت:</div>
              <div className="text-sm text-white">{transcript}</div>
            </div>
          )}

          {response && !isThinking && (
            <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <div className="text-xs text-purple-400 mb-1 flex items-center gap-1">
                <Brain className="w-3 h-3" />
                المساعد الذكي:
              </div>
              <div className="text-sm text-white">{response}</div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={startListening} disabled={isListening || isThinking} className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${isListening ? 'bg-red-500 text-white cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:scale-105 shadow-lg shadow-cyan-500/30'}`}>
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5 animate-pulse" />
                  جاري الاستماع...
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  تحدث الآن
                </>
              )}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="py-2 px-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-xs text-cyan-400 transition-colors flex items-center justify-center gap-1">
              <Zap className="w-3 h-3" />
              إنشاء فيديو
            </button>
            <button className="py-2 px-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-xs text-cyan-400 transition-colors flex items-center justify-center gap-1">
              <Brain className="w-3 h-3" />
              بناء وكيل
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-bold">Powered by Quantum AI</span>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl blur-xl opacity-20 -z-10 animate-pulse" />
      </div>
    </div>
  );
};

export default HolographicAI;
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Brain, Zap, Sparkles, X, Minimize2, Volume2, VolumeX, MessageSquare } from 'lucide-react';

const HolographicAI: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user'|'ai'; text: string}>>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isListening || isSpeaking) {
      initializeAudioVisualization().catch(err => console.warn(err));
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch (e) { /* ignore */ }
      }
    };
  }, [isListening, isSpeaking]);

  const initializeAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      drawWaveform();
    } catch (error) {
      console.warn('Microphone access denied or not available:', error);
    }
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = 300);
    const height = (canvas.height = 300);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      }

      ctx.clearRect(0, 0, width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      const time = Date.now() * 0.001;

      // Outer holographic rings
      for (let i = 0; i < 5; i++) {
        const radius = 50 + i * 24;
        const wobble = Math.sin(time * (1 + i * 0.2)) * 6;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + wobble, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,255,255,${0.18 - i * 0.02})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Audio reactive inner circle
      if (dataArrayRef.current && (isListening || isSpeaking)) {
        const arr = dataArrayRef.current;
        const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
        const innerRadius = 28 + (avg / 255) * 56;

        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, innerRadius);
        gradient.addColorStop(0, 'rgba(0,255,255,0.9)');
        gradient.addColorStop(0.6, 'rgba(138,43,226,0.6)');
        gradient.addColorStop(1, 'rgba(255,0,255,0.12)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // waveform bars
        const bars = 36;
        for (let i = 0; i < bars; i++) {
          const angle = (i / bars) * Math.PI * 2;
          const index = Math.floor((i / bars) * arr.length);
          const barHeight = ((arr[index] || 0) / 255) * 60;
          const x1 = centerX + Math.cos(angle) * (innerRadius + 8);
          const y1 = centerY + Math.sin(angle) * (innerRadius + 8);
          const x2 = centerX + Math.cos(angle) * (innerRadius + 8 + barHeight);
          const y2 = centerY + Math.sin(angle) * (innerRadius + 8 + barHeight);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          const r = Math.min(200, 100 + barHeight);
          const g = 255;
          const b = Math.max(50, 255 - barHeight);
          ctx.strokeStyle = `rgba(${r},${g},${b},0.85)`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      } else {
        // idle pulsing
        const pulse = 40 + Math.sin(time * 2) * 8;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulse, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulse);
        gradient.addColorStop(0, 'rgba(138,43,226,0.6)');
        gradient.addColorStop(1, 'rgba(0,255,255,0.08)');
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // center dots
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(time * 0.6);
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const x = Math.cos(angle) * 12;
        const y = Math.sin(angle) * 12;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fill();
      }
      ctx.restore();

      // subtle grid
      ctx.strokeStyle = 'rgba(0,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 22) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + Math.sin(time + i * 0.05) * 4, height);
        ctx.stroke();
      }
    };

    draw();
  };

  const startListening = async () => {
    setIsListening(true);
    setTranscript('');

    // Simulate recognition for demo
    setTimeout(() => {
      const exampleCommands = [
        'إنشاء فيديو جديد عن الذكاء الاصطناعي',
        'افتح تطبيق Agent Forge',
        'ما هي الوكلاء النشطة حالياً؟',
        'خطط لرحلة إلى دبي',
        'أنشئ workflow جديد'
      ];
      const randomCommand = exampleCommands[Math.floor(Math.random() * exampleCommands.length)];
      setTranscript(randomCommand);

      setTimeout(() => {
        setIsListening(false);
        processCommand(randomCommand);
      }, 1200);
    }, 800);
  };

  const processCommand = async (command: string) => {
    setIsThinking(true);
    setChatHistory(prev => [...prev, { type: 'user', text: command }]);

    setTimeout(() => {
      const responses = [
        'بالتأكيد! سأبدأ في إنشاء الفيديو الآن. سأستخدم Veo AI لتوليد المشاهد وسأجهز السكريبت.',
        'تم فتح Agent Forge. يمكنك الآن إنشاء وكيل جديد بالمواصفات التي تريدها.',
        'لديك 3 وكلاء نشطة حالياً: Video Creator، Workflow Studio، وCognito AI. جميعهم يعملون بكفاءة عالية.',
        'رائع! سأبحث عن أفضل العروض للرحلات إلى دبي وسأجهز خطة سفر متكاملة.',
        'تم إنشاء workflow جديد. يمكنك الآن إضافة الخطوات والمهام.'
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setResponse(randomResponse);
      setChatHistory(prev => [...prev, { type: 'ai', text: randomResponse }]);
      setIsThinking(false);

      if (!isMuted) speakResponse(randomResponse);
    }, 1000);
  };

  const speakResponse = (text: string) => {
    setIsSpeaking(true);
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ar-SA';
      utter.rate = 1.0;
      utter.pitch = 1.0;
      window.speechSynthesis.speak(utter);
    } catch (e) {
      // fallback simulated
      setTimeout(() => setIsSpeaking(false), 1400);
      return;
    }
    setTimeout(() => setIsSpeaking(false), 1400);
  };

  const toggleMinimize = () => setIsMinimized(v => !v);

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button onClick={toggleMinimize} className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform animate-pulse" style={{ animationDuration: '2s' }}>
          <Brain className="w-7 h-7" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">

      {showChat && (
        <div className="w-96 h-[500px] bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 flex flex-col overflow-hidden">

          <div className="bg-gradient-to-r from-cyan-500 to-purple-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-white" />
              <span className="text-white font-bold">AI Assistant</span>
            </div>
            <button onClick={() => setShowChat(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {chatHistory.length === 0 ? (
              <div className="text-center text-slate-400 mt-20">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-cyan-400" />
                <p>مرحباً! كيف يمكنني مساعدتك اليوم؟</p>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 ${msg.type === 'user' ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' : 'bg-slate-800/80 text-slate-200'}`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}

            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-slate-800/80 text-slate-200 rounded-2xl p-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 animate-pulse" />
                  <span>جاري التفكير...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-800/50 border-t border-slate-700/50">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="اكتب رسالتك..."
                className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                onKeyPress={(e: any) => {
                  const val = e.target.value as string;
                  if (e.key === 'Enter' && val?.trim()) {
                    processCommand(val.trim());
                    e.target.value = '';
                  }
                }}
              />
              <button onClick={startListening} className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-cyan-500 text-white hover:bg-cyan-600'}`}>
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}

