// src/app/chat/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  useEffect(() => {
    // Autenticación anónima en Firebase
    signInAnonymously(auth).catch((error) => {
      console.error("Error signing in anonymously: ", error);
    });

    // Suscripción a los mensajes en Firestore
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map((doc) => doc.data());
      setChat(messages);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMessage = {
        text: message,
        sender: 'user',
        timestamp: serverTimestamp(),
      };

      setChat((prevChat) => [...prevChat, userMessage]);
      setMessage('');

      try {
        await addDoc(collection(db, 'messages'), userMessage);
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
            <div key={index} className={`p-2 my-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-gray-800 self-start'}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 border border-gray-300 p-2 rounded-lg"
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