// src/app/chat/page.tsx
"use client";

import useChat from '../../hooks/useChat';
import Image from 'next/image';

const USER_ID = '1';
const CONVERSATION_ID = '1';
const USER_PROFILE_PIC_URL = '/man.png';
const BOT_PROFILE_PIC_URL = '/bot.png';

export default function Chat() {
  const {
    message,
    setMessage,
    chat,
    isTyping,
    handleSendMessage,
    handleKeyDown,
  } = useChat(USER_ID, CONVERSATION_ID, USER_PROFILE_PIC_URL, BOT_PROFILE_PIC_URL);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4">
          {chat.map((msg, index) => (
            <div key={index} className={`flex items-end mb-2 ${msg.sender === USER_ID ? 'justify-end' : 'justify-start'}`}>
              <Image src={msg.profilePicUrl} alt="profile picture" width={40} height={40} className="rounded-full mr-2" />
              <div className={`p-2 rounded-lg ${msg.sender === USER_ID ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {msg.prompt}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-end mb-2 justify-start">
              <Image src={BOT_PROFILE_PIC_URL} alt="bot typing" width={40} height={40} className="rounded-full mr-2" />
              <div className="p-2 rounded-lg bg-gray-200 text-gray-800">
                Comercial está escribiendo...
              </div>
            </div>
          )}
        </div>
        <div className="flex">
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
  );
}