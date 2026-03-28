import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useFilter } from '../lib/FilterContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star, StarHalf, Sparkles } from 'lucide-react';
import type { Dream } from '../lib/types';

interface AnalyticsDashboardProps {
  refreshKey: number;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ refreshKey }) => {
  const { session } = useAuth();
  const { filterWord, setFilterWord } = useFilter();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveDreams = async () => {
      if (!session) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('user_id', session.user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: true }); // Important: chronological order for charts

      if (!error && data) {
        setDreams(data as Dream[]);
      }
      setLoading(false);
    };
    fetchActiveDreams();
  }, [session, refreshKey]);

  if (loading) {
    return (
      <div className="analytics-section animate-slide-up" style={{ animationDelay: '0.2s', marginBottom: '2rem' }}>
        <div className="card shimmer-card" style={{ height: 300 }} />
      </div>
    );
  }

  const focusInput = () => {
    const el = document.getElementById('dream-textarea');
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const activeDreamsCount = dreams.length;

  // Process data for chart - robust against legacy nulls
  const validChartData = dreams
    .filter((d) => d.sentiment_score !== null && d.sentiment_score !== undefined)
    .map((d) => ({
      date: new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sentiment: d.sentiment_score,
      fullDate: d.created_at
    }));

  // Render Stars function
  const renderStars = (count: number) => {
    return (
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', margin: '16px 0', color: '#F59E0B' }}>
        {[1, 2, 3].map((num) => (
          <Star key={num} size={20} fill={num <= count ? 'currentColor' : 'transparent'} stroke="currentColor" opacity={num <= count ? 1 : 0.3} />
        ))}
      </div>
    );
  };

  if (activeDreamsCount === 0) {
    return (
      <div className="analytics-section animate-slide-up" style={{ marginBottom: '2rem' }}>
        <div className="card glass-panel" style={{ position: 'relative', overflow: 'hidden', padding: '3rem 2rem', textAlign: 'center' }}>
          {/* Faint Outline */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[{ date: '1', val: 5 }, { date: '2', val: 8 }, { date: '3', val: 4 }]}>
                <Line type="monotone" dataKey="val" stroke="#fff" strokeWidth={4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', position: 'relative' }}>Your celestial journal awaits.</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6, position: 'relative' }}>
            Insights emerge from patterns, not isolated events. To map your subconscious and identify recurring Jungian archetypes, we need a baseline of your psychic landscape.
          </p>
          
          {renderStars(0)}
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>0 / 3 dreams logged</p>
          
          <button className="btn btn-primary" onClick={focusInput} style={{ position: 'relative', boxShadow: '0 0 15px rgba(255, 255, 255, 0.4)' }}>
            Log Your First Dream
          </button>
        </div>
      </div>
    );
  }

  if (activeDreamsCount < 3) {
    return (
      <div className="analytics-section animate-slide-up" style={{ marginBottom: '2rem' }}>
        <div className="card glass-panel" style={{ position: 'relative', overflow: 'hidden', padding: '3rem 2rem', textAlign: 'center' }}>
          {/* Slightly more opaque Outline */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[{ date: '1', val: 4 }, { date: '2', val: 7 }, { date: '3', val: 9 }]}>
                <Line type="monotone" dataKey="val" stroke="#fff" strokeWidth={4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', position: 'relative' }}>The constellation is forming.</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6, position: 'relative' }}>
            We are beginning to see the shape of your subconscious. Log {3 - activeDreamsCount} more {3 - activeDreamsCount === 1 ? 'entry' : 'entries'} to unlock your emotional trendline and discover the dominant symbols driving your inner world.
          </p>
          
          {renderStars(activeDreamsCount)}
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{activeDreamsCount} / 3 dreams logged</p>
          
          <button className="btn" onClick={focusInput} style={{ position: 'relative', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
            Return to the Dreamscape
          </button>
        </div>
      </div>
    );
  }

  // Calculate top themes
  const themeCounts: Record<string, number> = {};
  dreams.forEach((d) => {
    const themes = d.main_themes || d.interpretation?.mainThemes || [];
    themes.forEach((t) => {
      // clean up tag strings logically if needed, but we'll group by exact string 
      // (ignoring emojis if possible, but matching exact is fine for now)
      themeCounts[t] = (themeCounts[t] || 0) + 1;
    });
  });

  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);

  return (
    <div className="analytics-section animate-slide-up" style={{ marginBottom: '2rem' }}>
      <h2 className="section-title">✨ Subconscious Analytics</h2>
      <div className="card glass-panel" style={{ padding: '2rem' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} /> Emotional Trendline
          </h3>
          <div style={{ height: 250, width: '100%', outline: 'none' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={validChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[1, 10]} stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}
                />
                <Line type="monotone" dataKey="sentiment" name="Sentiment (1-10)" stroke="#fff" strokeWidth={3} dot={{ fill: '#0f172a', stroke: '#fff', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#fff', stroke: '#fff', strokeWidth: 0, boxShadow: '0 0 10px #fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {topThemes.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              Dominant Archetypes
            </h3>
            <div className="history-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {topThemes.map((theme) => {
                const isActive = filterWord === theme;
                return (
                  <button
                    key={theme}
                    onClick={() => setFilterWord(isActive ? '' : theme)}
                    className="history-tag"
                    style={{
                      cursor: 'pointer',
                      border: 'none',
                      padding: '8px 16px',
                      background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      boxShadow: isActive ? '0 0 10px rgba(255,255,255,0.2)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {theme}
                  </button>
                );
              })}
            </div>
            {filterWord && (
               <p style={{ marginTop: 12, fontSize: '0.85rem', color: '#3B82F6' }}>
                 Filtering journal by archetype: <strong>{filterWord}</strong>
                 <button onClick={() => setFilterWord('')} style={{ background: 'none', border: 'none', color: '#ef4444', marginLeft: 8, cursor: 'pointer', textDecoration: 'underline' }}>Clear</button>
               </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AnalyticsDashboard;
