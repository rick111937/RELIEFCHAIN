import React from 'react';
import { useParams } from 'react-router-dom';

export default function DonatePage() {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-20 text-center animate-slide-up">
      <h1 className="text-4xl font-bold mb-4 font-sans text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
        Support Campaign #{id}
      </h1>
      <p className="text-xl text-slate-400">You are initiating a donation to smart contract vault for Project {id}.</p>
    </div>
  );
}
