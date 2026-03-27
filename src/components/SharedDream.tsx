import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Dream } from '../lib/types';

const SharedDream: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [dream, setDream] = useState<Dream | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchDream = async () => {
      if (!shareId) return;
      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('share_id', shareId)
        .eq('is_shared', true)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setDream(data as Dream);
      }
      setLoading(false);
    };
    fetchDream();
  }, [shareId]);

  if (loading) {
    return (
      <div className="page-container shared-page">
        <div className="loading-screen" style={{ minHeight: 'auto', padding: '80px 0' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (notFound || !dream || !dream.interpretation) {
    return (
      <div className="page-container shared-page">
        <div className="bg-effects"><div className="stars" /><div className="cloud cloud-1" /><div className="cloud cloud-2" /></div>
        <div className="empty-state" style={{ paddingTop: 100 }}>
          <div className="empty-state-icon">🌑</div>
          <p className="empty-state-text">This dream interpretation is no longer available.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 24 }}>Try Dream Interpreter</Link>
        </div>
      </div>
    );
  }

  const interp = dream.interpretation;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="bg-effects"><div className="stars" /><div className="cloud cloud-1" /><div className="cloud cloud-2" /><div className="cloud cloud-3" /></div>
      <div className="page-container shared-page">
        <div className="shared-header">
          <h1 className="shared-title">🌙 Dream Interpretation</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Shared on {new Date(dream.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="shared-dream-text">"{dream.dream_text}"</div>

        <div className="dream-result-grid">
          <div className="card animate-slide-up stagger-1">
            <h3 className="card-header">✨ Main Themes</h3>
            <div className="theme-tags">
              {interp.mainThemes.map((t, i) => <span key={i} className="theme-tag">{t}</span>)}
            </div>
          </div>

          <div className="card animate-slide-up stagger-2">
            <h3 className="card-header">💫 Emotional Atmosphere</h3>
            <p className="insight-text">{interp.emotionalTone}</p>
          </div>

          <div className="card animate-slide-up stagger-3">
            <h3 className="card-header">🔮 Dream Symbols</h3>
            {interp.symbols.map((s, i) => (
              <div key={i} className="symbol-item">
                <span className="symbol-name">{s.symbol}</span>
                <span className="symbol-meaning">{s.meaning}</span>
              </div>
            ))}
          </div>

          <div className="card animate-slide-up stagger-4">
            <h3 className="card-header">🌟 Personal Insight</h3>
            <p className="insight-text">{interp.personalInsight}</p>
          </div>

          <div className="card guidance-card animate-slide-up stagger-5">
            <h3 className="card-header">🧭 Guidance</h3>
            <p className="guidance-text">{interp.guidance}</p>
          </div>
        </div>

        <div className="shared-cta">
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Want to understand your own dreams?</p>
          <Link to="/" className="btn btn-primary">Try Dream Interpreter ✨</Link>
        </div>
      </div>
    </div>
  );
};

export default SharedDream;
