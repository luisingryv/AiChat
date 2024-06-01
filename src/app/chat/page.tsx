// src/app/chat/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import Image from 'next/image';

const USER_ID = '1';
const CONVERSATION_ID = '1';
const USER_PROFILE_PIC_URL = '/man.png';
const BOT_PROFILE_PIC_URL = '/bot.png';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Autenticación anónima en Firebase
    signInAnonymously(auth).catch((error) => {
      console.error("Error signing in anonymously: ", error);
    });

    // Suscripción a los mensajes en Firestore
    const q = query(
      collection(db, 'conversations', CONVERSATION_ID, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map((doc) => doc.data());
      setChat(messages);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMessage = {
        prompt: message,
        sender: 'user',
        timestamp: serverTimestamp(),
        profilePicUrl: USER_PROFILE_PIC_URL,
      };

      setChat((prevChat) => [...prevChat, userMessage]);
      setMessage('');
      setIsTyping(true);

      try {
        const ref = await addDoc(collection(db, 'conversations', CONVERSATION_ID, 'messages'), userMessage);

        const botResponseRef = await addDoc(collection(db, 'generate'), {
          prompt: message,
        });

        const unsubscribe = onSnapshot(doc(db, 'generate', botResponseRef.id), async (snap) => {
          if (snap.get('response')) {
            const botMessage = {
              prompt: snap.get('response'),
              sender: 'bot',
              timestamp: serverTimestamp(),
              profilePicUrl: BOT_PROFILE_PIC_URL,
            };

            await addDoc(collection(db, 'conversations', CONVERSATION_ID, 'messages'), botMessage);
            setChat((prevChat) => [...prevChat, botMessage]);
            setIsTyping(false);
            unsubscribe();
          }
        });
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4">
          {chat.map((msg, index) => (
            <div key={index} className={`flex items-end mb-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <Image src={msg.profilePicUrl} alt="profile picture" width={40} height={40} className="rounded-full mr-2" />
              <div className={`p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {msg.prompt}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-end mb-2 justify-start">
              <Image src={BOT_PROFILE_PIC_URL} alt="bot typing" width={40} height={40} className="rounded-full mr-2" />
              <div className="p-2 rounded-lg bg-gray-200 text-gray-800">
                El bot está escribiendo...
              </div>
            </div>
          )}
        </div>
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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