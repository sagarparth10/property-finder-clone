'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei/core/OrbitControls';
import * as THREE from 'three';

interface AIAvatarProps {
  onUserInput: (text: string) => void;
  avatarResponse: string | null;
  isListening: boolean;
}

export function AIAvatar({ onUserInput, avatarResponse, isListening }: AIAvatarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (transcript) {
          onUserInput(transcript);
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current?.start();
        }
      };
    }
  }, [onUserInput, isListening]);

  useEffect(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.start();
      setListening(true);
    } else if (!isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  }, [isListening]);

  // Avatar lip sync animation based on response
  useEffect(() => {
    if (meshRef.current && avatarResponse) {
      // Simple animation when avatar is speaking
      const interval = setInterval(() => {
        if (meshRef.current) {
          meshRef.current.rotation.y += 0.01;
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [avatarResponse]);

  // Speech synthesis for avatar response
  useEffect(() => {
    if (avatarResponse) {
      const utterance = new SpeechSynthesisUtterance(avatarResponse);
      utterance.lang = 'en-US';
      utterance.pitch = 1.1;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [avatarResponse]);

  return (
    <div className="w-full h-96 bg-gradient-to-br from-primary-100 to-primary-300 rounded-xl overflow-hidden shadow-2xl">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <directionalLight position={[0, 5, 5]} intensity={0.5} />
        
        {/* Avatar Mesh - Simplified 3D representation */}
        <mesh ref={meshRef} position={[0, 0, 0]}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshStandardMaterial color={listening ? '#f59e0b' : '#3b82f6'} />
        </mesh>
        
        <OrbitControls enableZoom={false} autoRotate={false} />
      </Canvas>
      
      {/* Status Overlay */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              listening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <span className="text-sm font-medium text-gray-700">
              {listening ? 'Listening...' : 'Ready'}
            </span>
          </div>
          
          {avatarResponse && (
            <p className="text-sm text-gray-600 animate-fade-in">
              {avatarResponse}
            </p>
          )}
        </div>
      </div>

      {/* Language Selector */}
      <div className="absolute top-4 right-4 flex gap-2">
        {['en', 'ar', 'fr', 'hi'].map((lang) => (
          <button
            key={lang}
            className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium hover:bg-white transition"
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

