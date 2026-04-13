import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../services/api';
import { ShieldCheck, Activity, Target } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState(1000);

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then(res => {
        setProject(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load project", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-20 text-center text-slate-400">Loading campaign data...</div>;
  if (!project) return <div className="p-20 text-center text-red-400">Campaign not found.</div>;

  const progress = (project.raisedAmount / project.targetAmount) * 100;

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-32 h-32 bg-slate-800 rounded-3xl flex items-center justify-center text-7xl shadow-xl border border-slate-700">
          {project.imageIcon || "🌍"}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-4xl font-bold">{project.name}</h1>
            <Badge variant={project.status === 'COMPLETED' ? 'warning' : 'success'}>
              {project.status}
            </Badge>
          </div>
          <p className="text-xl text-slate-400 max-w-3xl leading-relaxed">
            {project.description}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Action */}
        <Card className="lg:col-span-1 h-fit sticky top-24">
          <h3 className="text-lg font-bold mb-4 text-slate-300 flex items-center gap-2">
            <Target className="text-emerald-400" /> Goal Progress
          </h3>
          
          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-4xl font-bold text-white">₹{project.raisedAmount.toLocaleString('en-IN')}</span>
              <span className="text-emerald-400 font-medium mb-1">of ₹{project.targetAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-400 mb-2">Donation Amount (₹)</label>
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden focus-within:border-emerald-500 transition-colors">
              <span className="pl-4 text-slate-400 font-bold">₹</span>
              <input 
                type="number" 
                value={donationAmount} 
                onChange={(e) => setDonationAmount(Number(e.target.value))}
                className="w-full bg-transparent border-none text-white p-3 focus:outline-none focus:ring-0"
                min="100"
              />
            </div>
            <div className="flex gap-2 mt-3">
              {[500, 1000, 2500, 5000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setDonationAmount(amt)}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                    donationAmount === amt 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <Button 
            className="w-full h-14 text-lg mb-4 shadow-emerald-500/20"
            onClick={() => {
              if (donationAmount <= 0) {
                alert("Please enter a valid donation amount.");
                return;
              }
              // Mock success state
              alert(`Transaction for ₹${donationAmount.toLocaleString('en-IN')} sent to the ReliefFund smart contract successfully!`);
              setProject({...project, raisedAmount: project.raisedAmount + donationAmount});
            }}
          >
            Support Campaign (₹{donationAmount.toLocaleString('en-IN')})
          </Button>
          <div className="text-center text-sm text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Funds held securely in smart contract escrow
          </div>
        </Card>

        {/* Right Column: Capital Flow & Milestones */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-4">
              <Activity className="text-cyan-400" /> Capital Flow & Tranches
            </h3>
            
            <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
              
              {/* Tranche 1 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-900 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                   <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] pb-2">
                  <Badge variant="success" className="mb-2">TRANCHE 1 RELEASED</Badge>
                  <div className="glass-card !p-4">
                    <div className="flex justify-between font-bold mb-1">
                      <span>Emergency Logistics</span>
                      <span className="text-emerald-400">₹8,30,000</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">Initial mobilization of transport vehicles.</p>
                    <a href="#" className="text-xs text-cyan-400 hover:underline">View IPFS Receipt Proof ↗</a>
                  </div>
                </div>
              </div>

              {/* Tranche 2 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-900 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                   <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] pb-2 text-right">
                  <Badge variant="warning" className="mb-2">TRANCHE 2 PENDING DAO VOTE</Badge>
                  <div className="glass-card !p-4 !bg-slate-800/30 border-dashed text-left">
                    <div className="flex justify-between font-bold mb-1">
                      <span>Water Filtration Units</span>
                      <span className="text-slate-300">₹20,75,000</span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">Purchase of 500 units for coastal villages.</p>
                    <a href="/dao" className="text-xs text-amber-400 hover:underline">Vote on Proof in DAO ↗</a>
                  </div>
                </div>
              </div>

              {/* Tranche 3 */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-900 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                   <div className="w-2 h-2 bg-slate-600 rounded-full" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] pb-2 text-left">
                  <Badge variant="neutral" className="mb-2">TRANCHE 3 LOCKED</Badge>
                  <div className="glass-card !p-4 !bg-slate-900/50 opacity-50">
                    <div className="flex justify-between font-bold mb-1">
                      <span>Shelter Rebuilding</span>
                      <span className="text-slate-500 text-right">₹{(project.targetAmount - 2905000).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-sm text-slate-500">Milestone not yet initiated.</p>
                  </div>
                </div>
              </div>

            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
