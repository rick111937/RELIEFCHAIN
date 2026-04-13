import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

export default function RegisterNGOPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-20 animate-fade-in">
      <div className="max-w-xl mx-auto glass-card text-center relative overflow-hidden">
        
        {submitted ? (
          <div className="py-12 animate-slide-up">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Application Selected!</h2>
            <p className="text-slate-400 mb-8">
              Your NGO application has been sent to the Relief DAO for review. 
              Once verified, you will be able to access the NGO Portal and request milestone funding for your campaigns.
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Submit Another Application
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-4 font-sans text-slate-100">
              Register your NGO
            </h1>
            <p className="text-slate-400 mb-8">Submit your organization's details for ReliefChain verification.</p>
            
            <form className="space-y-4 text-left" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Organization Name</label>
                <input required type="text" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all" placeholder="E.g. Global Rescue" />
              </div>
              <button type="submit" className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all active:scale-95">
                Submit Application
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
