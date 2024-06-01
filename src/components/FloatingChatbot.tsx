// src/components/FloatingChatbot.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { ChatBubbleLeftEllipsisIcon, XMarkIcon } from '@heroicons/react/24/solid';
import useChat from '../hooks/useChat';
import Image from 'next/image';

const USER_ID = '1';
const CONVERSATION_ID = '1';
const USER_PROFILE_PIC_URL = '/man.png';
const BOT_PROFILE_PIC_URL = '/bot.png';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    message,
    setMessage,
    chat,
    isTyping,
    handleSendMessage,
    handleKeyDown,
  } = useChat(USER_ID, CONVERSATION_ID, USER_PROFILE_PIC_URL, BOT_PROFILE_PIC_URL);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, chat]);

  return (
    <div>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleChat}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          {isOpen ? <XMarkIcon className="h-6 w-6" /> : <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />}
        </button>
      </div>
      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg w-80 h-96">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-black">Comercial</h2>
              <button
                onClick={toggleChat}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {chat.map((msg, index) => (
                <div key={index} className={`flex items-end mb-2 ${msg.sender === USER_ID ? 'justify-end' : 'justify-start'}`}>
                  <Image src={msg.profilePicUrl} alt="profile picture" width={30} height={30} className="rounded-full mr-2" />
                  <div className={`p-2 rounded-lg ${msg.sender === USER_ID ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                    {msg.prompt}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-end mb-2 justify-start">
                  <Image src={BOT_PROFILE_PIC_URL} alt="bot typing" width={30} height={30} className="rounded-full mr-2" />
                  <div className="p-2 rounded-lg bg-gray-200 text-gray-800">
                    Comercial está escribiendo...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex p-2 border-t">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje..."
                className="flex-1 border border-gray-300 p-2 rounded-lg text-black"
              />
              <button
                onClick={handleSendMessage}
                className="ml-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChatbot;