// src/app/page.tsx
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">¡Bienvenidos al Taller de Chatbots Inteligentes!</h1>
        <p className="text-gray-700 mb-6">
          Aprende a crear un chatbot inteligente utilizando Google Cloud, Gemini, Next.js y Firebase.
        </p>
        <Image
          src="/vercel.svg"
          alt="Welcome to the Chatbot Workshop"
          width={400}
          height={250}
          className="mx-auto mb-6"
        />
        <Link href="/chat" className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
          Comenzar
        </Link>
      </div>
    </div>
  );
}
