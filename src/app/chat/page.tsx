'use client';

import { useState } from 'react';
import { Send, MessageSquare, Star, MapPin, Mail } from 'lucide-react';
import { VendorSearchResult } from '@/types';

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: Date;
  intent?: string;
  vendorData?: VendorSearchResult[];
}

type VendorCard = VendorSearchResult;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => 'session_' + Date.now());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // [R6.1] Call ViRA Chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          sessionId,
          conversationHistory: messages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content,
            timestamp: msg.timestamp
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: Date.now() + 1,
        content: data.message,
        isUser: false,
        timestamp: new Date(),
        intent: data.intent,
        vendorData: data.vendorData
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderVendorCards = (vendors: VendorCard[]) => {
    if (!vendors || vendors.length === 0) return null;

    return (
      <div className="mt-3 space-y-3">
        {vendors.slice(0, 3).map((vendor, index) => (
          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">{vendor.vendor_name}</h4>
                <p className="text-xs text-gray-600 mt-1">{vendor.service_categories}</p>
                {vendor.specialties && (
                  <p className="text-xs text-gray-500 mt-1">
                    <Star className="w-3 h-3 inline mr-1" />
                    {vendor.specialties}
                  </p>
                )}
              </div>
              <div className="text-right text-xs text-gray-500">
                {vendor.location && (
                  <p className="flex items-center justify-end">
                    <MapPin className="w-3 h-3 mr-1" />
                    {vendor.location}
                  </p>
                )}
                {vendor.contact_email && (
                  <p className="flex items-center justify-end mt-1">
                    <Mail className="w-3 h-3 mr-1" />
                    {vendor.contact_name || 'Contact'}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-single rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-headline font-bold text-single">ViRA Chat</h1>
              <p className="text-gray-600">Your AI assistant for vendor recommendations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-auto p-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-single-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-single" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a conversation with ViRA</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Ask me about vendors, project requirements, or get personalized recommendations for your next project.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <button 
                  onClick={() => setInputValue("What vendors do you recommend for web development?")}
                  className="px-4 py-2 bg-single-50 text-single-700 rounded-lg hover:bg-single-100 transition-colors text-sm"
                >
                  Web development vendors
                </button>
                <button 
                  onClick={() => setInputValue("Show me content writing vendors")}
                  className="px-4 py-2 bg-single-50 text-single-700 rounded-lg hover:bg-single-100 transition-colors text-sm"
                >
                  Content writers
                </button>
                <button 
                  onClick={() => setInputValue("Find data analytics specialists")}
                  className="px-4 py-2 bg-single-50 text-single-700 rounded-lg hover:bg-single-100 transition-colors text-sm"
                >
                  Data analytics
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl ${message.isUser ? 'ml-12' : 'mr-12'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 ${message.isUser
                          ? 'bg-single text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                      {/* [R6.8] Render vendor cards for search results */}
                      {!message.isUser && message.vendorData && renderVendorCards(message.vendorData)}
                      {/* [R6.8] Show intent badge for debugging */}
                      {!message.isUser && message.intent && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            {message.intent.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-2xl mr-12">
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">ViRA is typing...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask ViRA about vendors..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-single-500 focus:border-single-500"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="px-6 py-3 bg-single text-white rounded-lg hover:bg-single-600 focus:ring-2 focus:ring-single-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
