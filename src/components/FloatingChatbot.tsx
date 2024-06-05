// src/components/FloatingChatbot.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { ChatBubbleLeftEllipsisIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

const USER_PROFILE_PIC_URL = '/man.png';
const BOT_PROFILE_PIC_URL = '/bot.png';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    userId: '',
  });
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = `${user.firstName}-${user.lastName}-${Date.now()}`;
    setUser({ ...user, userId });
    setIsLoggedIn(true);

    const welcomeMessage = {
      prompt: `Hola, ${user.firstName}, bienvenido a EvolutecC, soy EvBot y estoy aquí para ayudarte a conocer más de nuestros productos y servicios y al final transferirte a nuestra área comercial, ¿Cómo te puedo ayudar el día de hoy?`,
      sender: 'bot',
      timestamp: serverTimestamp(),
      profilePicUrl: BOT_PROFILE_PIC_URL,
    };

    setChat([welcomeMessage]);

    try {
      await addDoc(collection(db, 'users'), {
        ...user,
        userId,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding user: ", error);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMessage = {
        prompt: message,
        sender: user.userId,
        timestamp: serverTimestamp(),
        profilePicUrl: USER_PROFILE_PIC_URL,
      };

      setChat((prevChat) => [...prevChat, userMessage]);
      setMessage('');
      setIsTyping(true);

      try {
        await addDoc(collection(db, 'conversations', user.userId, 'messages'), userMessage);

        const botResponseRef = await addDoc(collection(db, 'generate'), {
          prompt: message,
        });

        const unsubscribe = onSnapshot(doc(db, 'generate', botResponseRef.id), async (snap) => {
          if (snap.exists()) {
            const response = snap.get('response');
            if (response) {
              const botMessage = {
                prompt: response,
                sender: 'bot',
                timestamp: serverTimestamp(),
                profilePicUrl: BOT_PROFILE_PIC_URL,
              };

              await addDoc(collection(db, 'conversations', user.userId, 'messages'), botMessage);
              setChat((prevChat) => [...prevChat, botMessage]);
              setIsTyping(false);
              unsubscribe();
            }
          } else {
            console.error("No such document!");
          }
        });
      } catch (error) {
        console.error("Error adding document: ", error);
        setIsTyping(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

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
              {!isLoggedIn ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={user.firstName}
                    onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-lg text-black"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Apellido"
                    value={user.lastName}
                    onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-lg text-black"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Correo Electrónico"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-lg text-black"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Número de Celular"
                    value={user.phone}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded-lg text-black"
                    required
                  />
                  <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg w-full hover:bg-blue-700 transition">
                    Iniciar Chat
                  </button>
                </form>
              ) : (
                <>
                  {chat.map((msg, index) => (
                    <div key={index} className={`flex items-end mb-2 ${msg.sender === user.userId ? 'justify-end' : 'justify-start'}`}>
                      <Image src={msg.profilePicUrl} alt="profile picture" width={30} height={30} className="rounded-full mr-2" />
                      <div className={`p-2 rounded-lg ${msg.sender === user.userId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                        <ReactMarkdown>{msg.prompt}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex items-end mb-2 justify-start">
                      <Image src={BOT_PROFILE_PIC_URL} alt="bot typing" width={30} height={30} className="rounded-full mr-2" />
                      <div className="p-2 rounded-lg bg-gray-200 text-gray-800">
                        Comercial está escribiendo<span className="dot-ellipsis">...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            {isLoggedIn && (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChatbot;
