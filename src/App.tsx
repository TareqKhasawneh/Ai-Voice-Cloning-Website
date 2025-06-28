import React, { useState, useRef, useEffect } from 'react';
import { Mic, Upload, Play, Pause, Download, Trash2, Plus, AudioWaveform as Waveform, Volume2, Settings, User, Sparkles, FileAudio, ChevronRight, Clock, CheckCircle } from 'lucide-react';

interface VoiceModel {
  id: string;
  name: string;
  status: 'training' | 'ready' | 'failed';
  progress: number;
  duration: string;
  createdAt: string;
  sampleUrl?: string;
}

interface AudioFile {
  id: string;
  name: string;
  duration: string;
  size: string;
  url: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'record' | 'models' | 'generate'>('upload');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [voiceModels, setVoiceModels] = useState<VoiceModel[]>([
    {
      id: '1',
      name: 'Sarah\'s Voice',
      status: 'ready',
      progress: 100,
      duration: '2.5 hours',
      createdAt: '2024-01-15',
      sampleUrl: 'sample1.mp3'
    },
    {
      id: '2',
      name: 'Professional Narrator',
      status: 'training',
      progress: 67,
      duration: '1.8 hours',
      createdAt: '2024-01-14'
    }
  ]);
  const [dragOver, setDragOver] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('audio/')) {
        const newFile: AudioFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          duration: '0:00', // In real app, would calculate actual duration
          size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
          url: URL.createObjectURL(file)
        };
        setAudioFiles(prev => [...prev, newFile]);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    // In real app, would save the recording
    const newRecording: AudioFile = {
      id: Date.now().toString(),
      name: `Recording ${new Date().toLocaleTimeString()}`,
      duration: formatTime(recordingTime),
      size: '0.5 MB',
      url: '#'
    };
    setAudioFiles(prev => [...prev, newRecording]);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleAudioPlayback = (id: string) => {
    setPlayingAudio(playingAudio === id ? null : id);
  };

  const createVoiceModel = () => {
    const newModel: VoiceModel = {
      id: Date.now().toString(),
      name: 'New Voice Model',
      status: 'training',
      progress: 0,
      duration: '0 hours',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setVoiceModels(prev => [...prev, newModel]);
    
    // Simulate training progress
    const interval = setInterval(() => {
      setVoiceModels(prev => prev.map(model => {
        if (model.id === newModel.id && model.status === 'training') {
          const newProgress = Math.min(model.progress + Math.random() * 10, 100);
          return {
            ...model,
            progress: newProgress,
            status: newProgress >= 100 ? 'ready' : 'training'
          };
        }
        return model;
      }));
    }, 1000);

    setTimeout(() => clearInterval(interval), 15000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Waveform className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">VoiceClone AI</h1>
                <p className="text-xs text-gray-400">Professional Voice Cloning</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-black/20 backdrop-blur-sm p-1 rounded-lg border border-white/10">
          {[
            { key: 'upload', label: 'Upload Audio', icon: Upload },
            { key: 'record', label: 'Record', icon: Mic },
            { key: 'models', label: 'Voice Models', icon: User },
            { key: 'generate', label: 'Generate', icon: Sparkles }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === key
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Upload Training Audio</h2>
              <p className="text-gray-400">Upload high-quality audio files to train your voice model</p>
            </div>

            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                dragOver 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-300 mb-2">Drag and drop audio files here</p>
              <p className="text-gray-500 mb-4">or</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Browse Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
            </div>

            {/* Uploaded Files */}
            {audioFiles.length > 0 && (
              <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Uploaded Files</h3>
                <div className="space-y-3">
                  {audioFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileAudio className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="font-medium text-white">{file.name}</p>
                          <p className="text-sm text-gray-400">{file.duration} • {file.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleAudioPlayback(file.id)}
                          className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                          {playingAudio === file.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={createVoiceModel}
                  className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Start Training Voice Model
                </button>
              </div>
            )}
          </div>
        )}

        {/* Record Tab */}
        {activeTab === 'record' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Record Training Audio</h2>
              <p className="text-gray-400">Record high-quality audio samples for voice training</p>
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-white/10 p-8">
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all ${
                    isRecording 
                      ? 'bg-red-500 animate-pulse' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  }`}>
                    <Mic className="w-12 h-12 text-white" />
                  </div>
                  {isRecording && (
                    <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full border-4 border-red-300 animate-ping"></div>
                  )}
                </div>

                {isRecording ? (
                  <div className="space-y-4">
                    <div className="text-2xl font-mono text-white">
                      {formatTime(recordingTime)}
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-8 bg-purple-500 rounded animate-pulse"></div>
                      <div className="w-2 h-6 bg-purple-400 rounded animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-10 bg-purple-500 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-4 bg-purple-400 rounded animate-pulse" style={{animationDelay: '0.3s'}}></div>
                      <div className="w-2 h-12 bg-purple-500 rounded animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <button
                      onClick={stopRecording}
                      className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                    >
                      Stop Recording
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-400">Click to start recording</p>
                    <button
                      onClick={startRecording}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      Start Recording
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Recording Tips */}
            <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recording Tips</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <ChevronRight className="w-4 h-4 text-purple-400" />
                  <span>Use a quiet environment with minimal background noise</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ChevronRight className="w-4 h-4 text-purple-400" />
                  <span>Maintain consistent distance from the microphone</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ChevronRight className="w-4 h-4 text-purple-400" />
                  <span>Record at least 10-15 minutes of varied speech</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ChevronRight className="w-4 h-4 text-purple-400" />
                  <span>Include different emotions and speaking styles</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Voice Models Tab */}
        {activeTab === 'models' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Voice Models</h2>
                <p className="text-gray-400">Manage your trained voice models</p>
              </div>
              <button
                onClick={createVoiceModel}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Model</span>
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {voiceModels.map((model) => (
                <div key={model.id} className="bg-black/20 backdrop-blur-sm rounded-lg border border-white/10 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white">{model.name}</h3>
                      <p className="text-sm text-gray-400">Created {model.createdAt}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      model.status === 'ready' 
                        ? 'bg-green-500/20 text-green-400'
                        : model.status === 'training'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {model.status === 'ready' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                      {model.status === 'training' && <Clock className="w-3 h-3 inline mr-1" />}
                      {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                    </div>
                  </div>

                  {model.status === 'training' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Training Progress</span>
                        <span className="text-white">{Math.round(model.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${model.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      <Volume2 className="w-4 h-4 inline mr-1" />
                      {model.duration}
                    </div>
                    <div className="flex space-x-2">
                      {model.status === 'ready' && (
                        <>
                          <button className="p-2 text-gray-400 hover:text-white transition-colors">
                            <Play className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-white transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Generate Speech</h2>
              <p className="text-gray-400">Create speech using your trained voice models</p>
            </div>

            <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-white/10 p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Voice Model</label>
                  <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    {voiceModels.filter(m => m.status === 'ready').map(model => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Text to Speak</label>
                  <textarea
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={4}
                    placeholder="Enter the text you want to convert to speech..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Speed</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      defaultValue="1"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0.5x</span>
                      <span>1x</span>
                      <span>2x</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Pitch</label>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      defaultValue="0"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>-12</span>
                      <span>0</span>
                      <span>+12</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all">
                  <Sparkles className="w-5 h-5 inline mr-2" />
                  Generate Speech
                </button>
              </div>
            </div>

            {/* Generated Audio Preview */}
            <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Generated Audio</h3>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Volume2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Generated Speech</p>
                    <p className="text-sm text-gray-400">0:45 • 1.2 MB</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Play className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;