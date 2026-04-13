import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { CheckCircle, XCircle, FileText, ExternalLink } from 'lucide-react';

export default function DAOPage() {
  const [proposals, setProposals] = useState([
    {
      id: 1,
      campaignName: "Tsunami Relief - Southeast Asia",
      milestoneDesc: "Purchase and dispatch of 500 emergency water filtration units.",
      ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      status: "pending",
      votesFor: 12000,
      votesAgainst: 400
    },
    {
      id: 2,
      campaignName: "Wildfire Recovery - California",
      milestoneDesc: "Clearing debris and establishing 50 temporary housing shelters.",
      ipfsHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
      status: "approved",
      votesFor: 85000,
      votesAgainst: 1200
    }
  ]);

  const handleVote = (id, support) => {
    setProposals(prev => prev.map(p => {
      if (p.id === id && p.status === 'pending') {
        return {
          ...p,
          votesFor: support ? p.votesFor + 100 : p.votesFor,
          votesAgainst: !support ? p.votesAgainst + 100 : p.votesAgainst,
          status: 'voted' // Local optimistic UI update
        };
      }
      return p;
    }));
  };

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2">Relief DAO</h1>
          <p className="text-slate-400 max-w-2xl">
            Community governance portal. Review expenditure proofs submitted by NGOs on IPFS and vote to release the next tranche of funding from the smart contracts.
          </p>
        </div>
        <Badge variant="info" className="hidden sm:flex text-sm py-1.5 px-4 font-bold tracking-widest">
          VOTING POWER: 100 RLC
        </Badge>
      </div>

      <div className="space-y-6">
        {proposals.map(proposal => (
          <Card key={proposal.id} hover={false} className="border-slate-700/50">
            <div className="flex flex-col lg:flex-row gap-6 justify-between">
              
              <div className="space-y-4 flex-1">
                <div className="flex gap-3 items-center">
                  <Badge variant={proposal.status === 'approved' ? 'success' : proposal.status === 'voted' ? 'info' : 'warning'}>
                    {proposal.status.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-slate-500 font-mono">Proposal #{proposal.id}</span>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-slate-100">{proposal.campaignName}</h3>
                  <p className="text-slate-400 mt-1">{proposal.milestoneDesc}</p>
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-lg border border-slate-700 w-fit">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <a href={`https://ipfs.io/ipfs/${proposal.ipfsHash}`} target="_blank" rel="noreferrer" className="text-sm text-slate-300 hover:text-emerald-400 flex items-center gap-1">
                    View Proof Artifact <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="lg:border-l border-slate-700/50 lg:pl-6 min-w-[300px] flex flex-col justify-center">
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-emerald-400">{proposal.votesFor.toLocaleString()} For</span>
                    <span className="text-red-400">{proposal.votesAgainst.toLocaleString()} Against</span>
                  </div>
                  <div className="h-2 bg-red-500/20 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-emerald-500"
                      style={{ width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }}
                    ></div>
                    <div className="h-full bg-red-500 flex-1"></div>
                  </div>
                </div>

                {proposal.status === 'pending' ? (
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 gap-2 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" onClick={() => handleVote(proposal.id, true)}>
                      <CheckCircle className="w-4 h-4" /> Approve
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2 text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={() => handleVote(proposal.id, false)}>
                      <XCircle className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                ) : (
                  <Button variant="secondary" className="w-full" disabled>
                    {proposal.status === 'approved' ? 'Passed & Executed' : 'Vote Cast'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
