  Search,
  Menu,
  ChevronRight,
  User,
  Settings,
import React, { useEffect, useMemo, useState, useRef } from 'react';
  Layers,
  Mic,
  Brain,
  Cpu,
  Atom,
  Radio,
  Wifi,
  Battery,
  Volume2
  Cloud,
  Sun,
const AIOSDesktop = () => {
      </div>
  const [weather, setWeather] = useState({ temp: 23, condition: 'partly-cloudy' });
      <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity">
        {app.name}
  const [hoveredApp, setHoveredApp] = useState(null);
  const [particles, setParticles] = useState([]);
  const [theme, setTheme] = useState('quantum');
  const [voiceActive, setVoiceActive] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const canvasRef = useRef(null);

  // Themes Configuration
  const themes = {
    quantum: {
      name: 'Quantum',
      icon: '⚛️',
      gradient: 'from-purple-900 via-blue-900 to-cyan-900',
      accent: 'from-cyan-400 to-purple-400',
      particle: 'bg-cyan-400',
      glow: 'shadow-cyan-500/50'
    },
    neural: {
      name: 'Neural',
      icon: '🧠',
      gradient: 'from-pink-900 via-purple-900 to-indigo-900',
      accent: 'from-pink-400 to-purple-400',
      particle: 'bg-pink-400',
      glow: 'shadow-pink-500/50'
    },
    matrix: {
      name: 'Matrix',
      icon: '💚',
      gradient: 'from-green-950 via-emerald-950 to-black',
      accent: 'from-green-400 to-emerald-400',
      particle: 'bg-green-400',
      glow: 'shadow-green-500/50'
    },
    solar: {
      name: 'Solar',
      icon: '☀️',
      gradient: 'from-orange-900 via-red-900 to-yellow-900',
      accent: 'from-yellow-400 to-orange-400',
      particle: 'bg-yellow-400',
      glow: 'shadow-yellow-500/50'
    },
    void: {
      name: 'Void',
      icon: '🌑',
      gradient: 'from-slate-950 via-gray-900 to-black',
      accent: 'from-gray-400 to-slate-400',
      particle: 'bg-white',
      glow: 'shadow-white/50'
    }
  };
    </button>
  const currentTheme = themes[theme];
      { id: 'video-creator', name: 'Video Creator', icon: '🎥', color: 'from-red-500 to-orange-500', category: 'creative', new: true },
  // Apps configuration
  const apps = [
    {
      id: 'video-creator',
      name: 'Video Creator',
      icon: '🎬',
      color: 'from-purple-500 to-pink-500',
      category: 'creative',
      new: true,
      description: 'AI-powered video generation'
    },
    {
      id: 'agent-forge',
      name: 'Agent Forge',
      icon: '🔧',
      color: 'from-cyan-500 to-blue-500',
      category: 'ai',
      new: true,
      description: 'Build custom AI agents'
    },
    {
      id: 'cognito',
      name: 'Cognito AI',
      icon: '🧠',
      color: 'from-blue-500 to-indigo-500',
      category: 'ai',
      status: 'active',
      description: 'Neural network assistant'
    },
    {
      id: 'trip-planner',
      name: 'Trip Planner',
      icon: '✈️',
      color: 'from-green-500 to-teal-500',
      category: 'productivity',
      description: 'Smart travel planning'
    },
    {
      id: 'workflow-studio',
      name: 'Workflow Studio',
      icon: '⚡',
      color: 'from-yellow-500 to-orange-500',
      category: 'productivity',
      status: 'active',
      description: 'Automate your tasks'
    },
    {
      id: 'quantum-lab',
      name: 'Quantum Lab',
      icon: '⚛️',
      color: 'from-purple-500 to-cyan-500',
      category: 'ai',
      new: true,
      description: 'Quantum computing experiments'
    },
    {
      id: 'neural-canvas',
      name: 'Neural Canvas',
      icon: '🎨',
      color: 'from-pink-500 to-rose-500',
      category: 'creative',
      description: 'AI art generation'
    },
    {
      id: 'gemini-news',
      name: 'AI News',
      icon: '📰',
      color: 'from-cyan-500 to-blue-500',
      category: 'info',
      description: 'Real-time AI news feed'
    },
    {
      id: 'translate-hub',
      name: 'Translate Hub',
      icon: '🌐',
      color: 'from-emerald-500 to-green-500',
      category: 'tools',
      description: 'Universal translator'
    },
    {
      id: 'code-nexus',
      name: 'Code Nexus',
      icon: '💻',
      color: 'from-indigo-500 to-purple-500',
      category: 'dev',
      description: 'AI coding assistant'
    },
    {
      id: 'data-forge',
      name: 'Data Forge',
      icon: '📊',
      color: 'from-orange-500 to-red-500',
      category: 'analytics',
      description: 'Data visualization'
    },
    {
      id: 'voice-lab',
      name: 'Voice Lab',
      icon: '🎤',
      color: 'from-teal-500 to-cyan-500',
      category: 'audio',
      description: 'Voice synthesis & clone'
    }
  ];
  const workspaces = [
    { id: 0, name: 'Main', icon: '🏠', color: 'from-purple-500 to-pink-500' },
    { id: 1, name: 'Creative', icon: '🎨', color: 'from-pink-500 to-orange-500' },
    { id: 2, name: 'AI Lab', icon: '🤖', color: 'from-cyan-500 to-blue-500' },
    { id: 3, name: 'Dev', icon: '💻', color: 'from-green-500 to-teal-500' }
  ];
  const quickActions = [
    { id: 'new-video', name: 'Create Video', icon: '🎬', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { id: 'new-agent', name: 'Build Agent', icon: '🤖', color: 'bg-gradient-to-r from-cyan-500 to-blue-500' },
    { id: 'generate-art', name: 'Generate Art', icon: '🎨', color: 'bg-gradient-to-r from-pink-500 to-rose-500' },
    { id: 'start-workflow', name: 'Run Workflow', icon: '⚡', color: 'bg-gradient-to-r from-yellow-500 to-orange-500' }
  ];

  // Quantum Particle System
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particlesArray = [];
    const numberOfParticles = theme === 'quantum' ? 100 : 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = theme === 'quantum' ? 'rgba(0, 255, 255, 0.5)' :
                      theme === 'neural' ? 'rgba(255, 0, 255, 0.5)' :
                      theme === 'matrix' ? 'rgba(0, 255, 0, 0.5)' :
                      theme === 'solar' ? 'rgba(255, 200, 0, 0.5)' :
                      'rgba(255, 255, 255, 0.5)';
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }

    function connectParticles() {
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = particlesArray[a].color;
            ctx.lineWidth = 0.2;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }

      connectParticles();
      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [theme]);
  const getGreeting = () => {
  const filteredApps = searchQuery
    ? apps.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : apps;
  const toggleVoice = () => {
    setVoiceActive(!voiceActive);
    if (!voiceActive) {
      setAiThinking(true);
      setTimeout(() => setAiThinking(false), 2000);
    }
      {/* Quantum Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-30 pointer-events-none"
      />

      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient} opacity-40 animate-pulse`}
           style={{ animationDuration: '10s' }} />
      {/* Radial Gradient Overlay */}
      <div className="absolute inset-0 bg-radial-gradient opacity-20"
           style={{ background: 'radial-gradient(circle at 50% 50%, rgba(100, 100, 255, 0.1), transparent 70%)' }} />
      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col p-6">

        {/* Header - Holographic Design */}
        <div className="relative bg-slate-900/20 backdrop-blur-xl rounded-3xl p-6 mb-6 border border-white/10 shadow-2xl overflow-hidden group">
          {/* Holographic Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          <div className="relative flex items-center justify-between">
              {/* Animated Avatar */}
              <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${currentTheme.accent} flex items-center justify-center text-3xl`}>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent animate-spin" style={{ animationDuration: '3s' }} />
                <span className="relative z-10">👨‍💻</span>
                {voiceActive && (
                  <div className="absolute -inset-2 rounded-full border-2 border-cyan-400 animate-ping" />
                )}
              </div>

                <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                  {getGreeting()},
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accent} animate-pulse`}>
                    User
                  </span>
                  {aiThinking && (
                    <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
                  )}
                </h1>
                <p className="text-slate-300 text-sm mt-2 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  {time.toLocaleDateString('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' })}
                  <span className="mx-2">•</span>
                  <Atom className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
                  <span className="text-purple-400">Quantum Mode Active</span>
                </p>
            {/* Right Side Stats */}
              {/* System Status */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-green-400">
                  <Cpu className="w-4 h-4" />
                  <span className="text-xs">CPU: 45%</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-400">
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span className="text-xs">3 Agents Active</span>
                </div>
              </div>

                <div className="text-xs text-slate-400 mb-1">AI Credits</div>
                <div className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accent} flex items-center gap-2`}>
                  <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                  1,000
                </div>
              </div>

              {/* Weather Widget */}
              <div className={`flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10 ${currentTheme.glow}`}>
                <Cloud className="w-7 h-7 text-blue-400 animate-bounce" style={{ animationDuration: '3s' }} />
                <div>
                  <div className="text-3xl font-bold text-white">{weather.temp}°</div>
                  <div className="text-xs text-slate-400">مشمس</div>
                </div>
              {/* Time Display */}
                <div className={`text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accent} tabular-nums`}>
                  {time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-slate-400 text-sm mt-1">من</div>
              </div>
            </div>

          {/* Advanced Search Bar */}
          <div className="mt-6 relative group/search">
            <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme.accent} rounded-2xl blur opacity-0 group-hover/search:opacity-20 transition-opacity`} />
            <div className="relative flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث أو اسأل الـ AI أي شيء..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 backdrop-blur-md transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
              {/* Voice Button */}
              <button
                onClick={toggleVoice}
                className={`p-4 rounded-2xl border transition-all ${
                  voiceActive
                    ? 'bg-cyan-500 border-cyan-400 text-white animate-pulse'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>
              {/* AI Assistant Button */}
              <button className={`p-4 rounded-2xl bg-gradient-to-r ${currentTheme.accent} text-white font-medium hover:scale-105 transition-transform ${currentTheme.glow}`}>
                <Brain className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6">
          {/* Theme Switcher */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {Object.entries(themes).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md transition-all border ${
                  theme === key
                    ? 'bg-white/20 border-white/30 scale-105'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="text-xl">{t.icon}</span>
                <span className="text-sm font-medium text-white whitespace-nowrap">{t.name}</span>
              </button>
            ))}
          </div>

          {/* Apps Grid - Holographic Cards */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Layers className={`w-6 h-6 text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accent}`} />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accent}`}>
                Your Universe
              </span>
            </h2>

              {filteredApps.map((app, index) => (
                <div
                  key={app.id}
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setHoveredApp(app.id)}
                  onMouseLeave={() => setHoveredApp(null)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${app.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300`} />

                  {/* Card */}
                  <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:scale-105 hover:-translate-y-1 overflow-hidden">
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                    {/* Icon */}
                    <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center text-3xl mb-3 mx-auto group-hover:scale-110 transition-transform shadow-lg ${currentTheme.glow}`}>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                      <span className="relative z-10">{app.icon}</span>
                    </div>

                    {/* Name */}
                    <div className="text-center text-sm font-semibold text-white mb-1">{app.name}</div>

                    {/* Description */}
                    <div className="text-center text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {app.description}
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {app.new && (
                        <div className={`bg-gradient-to-r ${currentTheme.accent} text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse`}>
                          NEW
                        </div>
                      )}
                      {app.status === 'active' && (
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Hover Info Card */}
                  {hoveredApp === app.id && (
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl text-white text-xs px-4 py-3 rounded-xl whitespace-nowrap z-50 border border-white/20 shadow-2xl">
                      <div className="font-bold mb-1">{app.name}</div>
                      <div className="text-slate-400">{app.description}</div>
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-b-slate-900" />
                    </div>
                  )}

          {/* Quick Actions - Quantum Style */}
          <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" style={{ animationDuration: '5s' }} />
            <h2 className="relative text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accent}`}>
                Quantum Actions
              </span>
            </h2>

            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className={`group flex flex-col items-center gap-3 p-5 rounded-2xl ${action.color} text-white transition-all hover:scale-105 shadow-lg hover:shadow-2xl border border-white/20`}
                >
                  <div className="text-3xl group-hover:scale-125 transition-transform">
                    {action.icon}
                  </div>
                  <span className="text-sm font-semibold text-center">{action.name}</span>
        {/* Bottom Taskbar - Futuristic */}
        <div className="mt-6 relative bg-slate-900/40 backdrop-blur-2xl rounded-3xl p-4 border border-white/10 shadow-2xl overflow-hidden">
          {/* Animated Background Line */}
          <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${currentTheme.accent} animate-pulse`} style={{ width: '100%', animationDuration: '2s' }} />

          <div className="relative flex items-center justify-between">
                <button
                  key={ws.id}
                  onClick={() => setActiveWorkspace(ws.id)}
                  className={`group flex items-center gap-2 px-4 py-3 rounded-xl transition-all border ${
                    activeWorkspace === ws.id
                      ? `bg-gradient-to-r ${ws.color} text-white border-white/20 scale-105 shadow-lg`
                      : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="text-xl">{ws.icon}</span>
                  <span className="text-sm font-medium">{ws.name}</span>
            {/* Quick Launch Apps */}
            <div className="flex items-center gap-2">
              {apps.slice(0, 8).map(app => (
                <div
                  key={app.id}
                  className="relative group"
                >
                  <button className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all flex items-center justify-center text-xl border border-white/10 hover:border-white/20 hover:scale-110">
                    {app.icon}
                  </button>
                  {app.status === 'active' && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  )}
                </div>
            {/* System Tray */}
            <div className="flex items-center gap-3">
              <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20 relative">
                <Wifi className="w-5 h-5 text-green-400" />
              </button>
              <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20 relative">
                <Volume2 className="w-5 h-5 text-cyan-400" />
              </button>
              <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20 relative">
                <Battery className="w-5 h-5 text-yellow-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </button>
              <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20 relative">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  3
                </span>
              </button>
              <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20">
                <Settings className="w-5 h-5 text-slate-400" />
              </button>

              {/* Powered by Badge */}
              <div className={`flex items-center gap-2 bg-gradient-to-r ${currentTheme.accent} rounded-xl px-4 py-2.5 ml-2 ${currentTheme.glow}`}>
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
                <span className="text-sm text-white font-bold">Quantum OS</span>

      {/* Floating AI Assistant */}
      <button className={`fixed bottom-24 right-8 w-16 h-16 rounded-full bg-gradient-to-r ${currentTheme.accent} flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform z-50 ${currentTheme.glow} animate-bounce`}
              style={{ animationDuration: '3s' }}>
        <Brain className="w-7 h-7" />
        <div className="absolute -inset-1 rounded-full border-2 border-white/20 animate-ping" />
      </button>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-yellow-400" />مقترحة لك الآن</h2>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {suggestedApps.map(app => (
                  <div key={app.id} className="flex-shrink-0 w-40 h-40 bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50 hover:border-purple-500/50 transition-all cursor-pointer group hover:scale-105" onMouseEnter={() => setHoveredApp(app.id)} onMouseLeave={() => setHoveredApp(null)}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>{app.icon}</div>
                    <div className="text-sm font-medium text-white">{app.name}</div>
                    {app.status === 'active' && (<div className="flex items-center gap-1 text-xs text-green-400 mt-1"><Activity className="w-3 h-3" />نشط</div>)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apps Grid */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Layers className="w-5 h-5 text-purple-400" />جميع التطبيقات</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredApps.map(app => (
                <div key={app.id} className="relative group" onMouseEnter={() => setHoveredApp(app.id)} onMouseLeave={() => setHoveredApp(null)}>
                  <AppTile app={app} onOpen={openApp} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" />إجراءات سريعة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map(action => (
                <button key={action.id} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-purple-500/50 transition-all group hover:scale-105">
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform`}>{action.icon}</div>
                  <span className="text-sm font-medium text-white text-center">{action.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Taskbar */}
        <div className="mt-6 bg-slate-900/60 backdrop-blur-md rounded-3xl p-4 border border-slate-700/50 shadow-2xl">
          <div className="flex items-center justify-between">
            {/* Workspaces */}
            <div className="flex gap-2">
              {workspaces.map(ws => (
                <button key={ws.id} onClick={() => setActiveWorkspace(ws.id)} className={`px-4 py-2 rounded-xl transition-all ${activeWorkspace === ws.id ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}>
                  <span className="mr-2">{ws.icon}</span>
                  {ws.name}
                </button>
              ))}
            </div>

            {/* Taskbar Apps */}
            <div className="flex items-center gap-3">
              {apps.slice(0, 6).map(app => (
                <button key={app.id} className="w-12 h-12 rounded-xl bg-slate-800/50 hover:bg-slate-700 transition-all flex items-center justify-center text-2xl relative group" onClick={() => openApp(app.id)}>
                  {app.icon}
                  {app.status === 'active' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-1 h-1 bg-green-400 rounded-full" />}
                </button>
              ))}
            </div>

            {/* System Icons */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 transition-all"><Bell className="w-5 h-5 text-slate-400" /></button>
              <button className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 transition-all"><SettingsIcon className="w-5 h-5 text-slate-400" /></button>
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl px-3 py-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-white font-medium">Powered by Gemini</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIOSDesktop;

