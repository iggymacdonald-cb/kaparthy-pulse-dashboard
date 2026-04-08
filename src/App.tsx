import { useEffect, useState } from 'react';
import { Post } from './types';
import { fetchPosts } from './lib/api';
import { Activity, Users, Cpu, Clock, Terminal } from 'lucide-react';

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'human' | 'agent'>('all');

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchPosts(100);
      setPosts(data);
      if (data.length > 0) {
        setTotalPosts(data[0].id);
      }
      setLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Calculate velocity (posts per hour)
  const velocity = posts.length >= 2 
    ? Math.round((posts.length / ((new Date(posts[0].created_at).getTime() - new Date(posts[posts.length - 1].created_at).getTime()) / 3600000)))
    : 0;

  // Split bots vs humans
  //const isAgent = (post: Post) => post.content.includes('#AI');
  // Split bots vs humans
  const isAgent = (post: Post) => {
    const text = post.content_markdown || post.content || '';
    return text.includes('#AI');
  };
  const agentPosts = posts.filter(isAgent);
  const humanPosts = posts.filter(p => !isAgent(p));

  // Top contributors
  const contributors = posts.reduce((acc, post) => {
    acc[post.author.username] = (acc[post.author.username] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topContributors = Object.entries(contributors)
    .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
    .slice(0, 5);

  const displayedPosts = filter === 'all' ? posts : filter === 'human' ? humanPosts : agentPosts;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e0e0e0] font-mono p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-8 border-b border-[#333] pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-6 h-6 text-[#00ff00]" />
          <h1 className="text-xl font-bold tracking-tight uppercase text-white">Karpathy Pulse</h1>
        </div>
        <div className="text-xs text-[#888] flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff00] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff00]"></span>
          </span>
          LIVE
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Metrics & Leaderboard */}
        <div className="space-y-8">
          {/* Metrics Banner */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-[#141414] border border-[#333] p-4 rounded-lg">
              <div className="text-[#888] text-xs uppercase mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Total Posts
              </div>
              <div className="text-3xl font-bold text-white">
                {loading ? '...' : totalPosts.toLocaleString()}
              </div>
            </div>
            <div className="bg-[#141414] border border-[#333] p-4 rounded-lg">
              <div className="text-[#888] text-xs uppercase mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Velocity
              </div>
              <div className="text-3xl font-bold text-white">
                {loading ? '...' : `${velocity}/hr`}
              </div>
            </div>
          </section>

          {/* Bot vs Builder Split */}
          <section className="bg-[#141414] border border-[#333] p-4 rounded-lg">
            <h2 className="text-[#888] text-xs uppercase mb-4">Network Composition (Last 100)</h2>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Builders</span>
              </div>
              <span className="text-sm font-bold">{humanPosts.length}%</span>
            </div>
            <div className="w-full bg-[#222] h-2 rounded-full mb-4 overflow-hidden">
              <div className="bg-blue-400 h-full transition-all duration-500" style={{ width: `${humanPosts.length}%` }}></div>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#00ff00]" />
                <span className="text-sm">Agents</span>
              </div>
              <span className="text-sm font-bold">{agentPosts.length}%</span>
            </div>
            <div className="w-full bg-[#222] h-2 rounded-full overflow-hidden">
              <div className="bg-[#00ff00] h-full transition-all duration-500" style={{ width: `${agentPosts.length}%` }}></div>
            </div>
          </section>

          {/* Top Contributors */}
          <section className="bg-[#141414] border border-[#333] p-4 rounded-lg">
            <h2 className="text-[#888] text-xs uppercase mb-4">Top Contributors</h2>
            <div className="space-y-3">
              {topContributors.map(([username, count], idx) => (
                <div key={username} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[#555] text-xs w-4">{idx + 1}</span>
                    <span className="text-sm text-[#ccc]">@{username}</span>
                  </div>
                  <span className="text-xs bg-[#222] px-2 py-1 rounded text-[#888]">{count} posts</span>
                </div>
              ))}
              {topContributors.length === 0 && !loading && (
                <div className="text-sm text-[#555]">No contributors found.</div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Live Stream */}
        <div className="lg:col-span-2 bg-[#141414] border border-[#333] rounded-lg flex flex-col h-[800px]">
          <div className="p-4 border-b border-[#333] flex items-center justify-between">
            <h2 className="text-[#888] text-xs uppercase">Live Activity Stream</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${filter === 'all' ? 'bg-white text-black border-white' : 'border-[#444] text-[#888] hover:border-[#666]'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('human')}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${filter === 'human' ? 'bg-blue-400 text-black border-blue-400' : 'border-[#444] text-[#888] hover:border-[#666]'}`}
              >
                Builders
              </button>
              <button 
                onClick={() => setFilter('agent')}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${filter === 'agent' ? 'bg-[#00ff00] text-black border-[#00ff00]' : 'border-[#444] text-[#888] hover:border-[#666]'}`}
              >
                Agents
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="text-center text-[#555] py-8">Loading stream...</div>
            ) : displayedPosts.length === 0 ? (
              <div className="text-center text-[#555] py-8">No posts found for this filter.</div>
            ) : (
              displayedPosts.map(post => (
                <div 
                  key={post.id} 
                  className={`p-4 rounded-lg border transition-colors ${isAgent(post) ? 'bg-[#00ff00]/5 border-[#00ff00]/20' : 'bg-[#222] border-[#333]'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${isAgent(post) ? 'text-[#00ff00]' : 'text-blue-400'}`}>
                        @{post.author.username}
                      </span>
                      {isAgent(post) && <Cpu className="w-3 h-3 text-[#00ff00]" />}
                    </div>
                    <span className="text-[#666] text-xs">
                      {new Date(post.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-[#ccc] leading-relaxed break-words">
                    {post.content}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-[#555] text-xs">
                    <span>ID: {post.id}</span>
                    {post.parent_post_id && <span>Reply to: {post.parent_post_id}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
