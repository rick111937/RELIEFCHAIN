import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, TrendingUp, Heart, Filter } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../services/api';

export default function ExplorePage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Medical', 'Food', 'Shelter', 'Rescue', 'Infrastructure'];

  useEffect(() => {
    api.get('/projects')
      .then(res => {
        setProjects(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch projects", err);
        setLoading(false);
      });
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                           project.description.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen pb-32 overflow-hidden bg-slate-900 border-x-0 selection:bg-emerald-500/30">
      
      {/* Background Structural Mesh & Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="bg-grid opacity-60"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <div className="container mx-auto px-4 py-28 relative z-10 animate-fade-in">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6 bg-emerald-500/[0.05] border border-emerald-500/20 rounded-full px-4 py-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span className="text-emerald-300 text-xs font-bold uppercase tracking-widest">Global Discovery</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight drop-shadow-2xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-white">Explore</span>
            <br className="md:hidden" />
            {' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 italic">Campaigns</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400/90 max-w-2xl mx-auto font-light leading-relaxed">
            Browse verified disaster relief projects and directly support those in crisis. Every contribution accelerates recovery immediately.
          </p>
        </div>

      {/* Search & Filters */}
      <div className="max-w-5xl mx-auto mb-20">
        <div className="bg-[#0b1626]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden group/search">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-cyan-500/0 opacity-0 group-hover/search:opacity-100 transition-opacity duration-1000" />
          
          <div className="flex flex-col md:flex-row gap-4 items-center relative z-10">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400/70 w-6 h-6 peer-focus:text-emerald-400 transition-colors" />
              <input
                type="text"
                placeholder="Search emergency funds, regions, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 hover:bg-slate-900/80 border border-slate-700/50 rounded-2xl pl-14 pr-6 py-4 text-white text-lg placeholder-slate-500/70 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-900 focus:ring-4 focus:ring-emerald-500/10 transition-all font-sans shadow-inner placeholder:font-light"
              />
            </div>
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 font-medium">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700/80 hover:text-white border border-slate-700/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-20 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
          <span>Loading campaigns...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center text-slate-500 py-20">
          <Filter className="w-16 h-16 mx-auto mb-4 text-slate-600 animate-pulse" />
          <p className="text-lg text-slate-400 font-sans">No campaigns found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map(project => {
            const progress = Math.min((project.raisedAmount / project.targetAmount) * 100, 100);
            
            return (
              <Card key={project._id} className="group p-0 overflow-hidden flex flex-col hover:border-emerald-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-900/10 border border-white/5">
                {/* Banner Image / Cover */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                  {project.bannerImage ? (
                    <img 
                      src={project.bannerImage} 
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900/40 via-slate-900 to-cyan-900/40 flex items-center justify-center">
                      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />
                    </div>
                  )}
                  
                  {/* Glassy Overlay Badges */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between">
                    <Badge variant={project.status === 'COMPLETED' ? 'warning' : 'success'} className="backdrop-blur-md bg-opacity-80 shadow-md">
                      {project.status}
                    </Badge>
                    <div className="bg-slate-950/60 backdrop-blur-md rounded-lg p-1.5 cursor-pointer hover:bg-slate-800/80 transition-colors">
                      <Heart className="w-4 h-4 text-rose-400 fill-current" />
                    </div>
                  </div>
                </div>

                {/* Floating Avatar/Icon */}
                <div className="relative px-6">
                  <div className="absolute -top-10 left-6 text-4xl bg-slate-900 w-20 h-20 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform duration-500 shadow-2xl glass-effect">
                    {project.imageIcon || "🌍"}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 pt-12 flex-1 flex flex-col z-10 relative">
                  <div className="flex items-center gap-2 mb-4 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                    {project.location && (
                      <span className="flex items-center gap-1.5 bg-emerald-500/[0.08] px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-inner">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        {project.location}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold mb-3 line-clamp-1 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-cyan-400 transition-all font-sans drop-shadow-md">
                    {project.name}
                  </h3>
                  <p className="text-slate-400/90 text-sm mb-6 line-clamp-2 leading-relaxed flex-1 font-sans font-light">
                    {project.description}
                  </p>

                  <div className="mt-6">
                    <div className="flex justify-between items-baseline mb-2 info-row">
                      <div>
                        <span className="text-xl font-bold text-white">₹{project.raisedAmount.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-slate-500 ml-1">raised</span>
                      </div>
                      <span className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">{progress.toFixed(0)}%</span>
                    </div>

                    {/* Styled Progress Bar */}
                    <div className="h-2.5 bg-slate-800/80 rounded-full overflow-hidden mb-5 border border-slate-700/30">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-1000 relative rounded-full"
                        style={{ width: `${progress}%` }}
                      >
                        {progress > 10 && (
                          <div className="absolute inset-y-0 right-0 w-2 bg-white/20 animate-pulse" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-6 font-sans font-medium tracking-wide uppercase">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-slate-400" /> Goal: ₹{project.targetAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-900 font-extrabold tracking-wide shadow-[0_4px_20px_rgba(16,185,129,0.3)] group-hover:shadow-[0_8px_30px_rgba(16,185,129,0.5)] group-hover:scale-[1.03] transition-all duration-300 py-4 text-md" onClick={() => navigate(`/project/${project._id}`)}>
                      Review & Support Action
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
