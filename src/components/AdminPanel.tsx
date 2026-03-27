import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Dream } from '../lib/types';

const AdminPanel: React.FC = () => {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchShared = async () => {
      const { data, error } = await supabase
        .from('dreams')
        .select('*')
        .eq('is_shared', true)
        .order('created_at', { ascending: false });

      if (!error && data) setDreams(data as Dream[]);
      setLoading(false);
    };
    fetchShared();
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <h1 className="section-title" style={{ marginBottom: 8 }}>
        <Shield size={22} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
        Admin Panel
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 32 }}>
        All publicly shared dream interpretations ({dreams.length} total)
      </p>

      {loading ? (
        <div className="card"><div className="shimmer shimmer-line" /><div className="shimmer shimmer-line" /><div className="shimmer shimmer-line" /></div>
      ) : dreams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p className="empty-state-text">No shared dreams yet.</p>
        </div>
      ) : (
        <div className="admin-grid">
          {dreams.map((dream) => (
            <div
              key={dream.id}
              className="card history-card"
              onClick={() => setExpandedId(expandedId === dream.id ? null : dream.id)}
            >
              <div className="admin-card-meta">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                    {dream.user_email || 'Anonymous'}
                  </span>
                  {dream.interpretation?.userName && (
                    <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                      {dream.interpretation.userName} • {dream.interpretation.userGender || 'Neutral'}
                    </span>
                  )}
                </div>
                <span>{formatDate(dream.created_at)}</span>
              </div>
              <div className="admin-dream-text">{dream.dream_text}</div>

              {expandedId === dream.id && dream.interpretation && (
                <div className="history-expanded" onClick={(e) => e.stopPropagation()}>
                  <div style={{ marginBottom: 12 }}>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Themes:</strong>
                    <div className="theme-tags" style={{ marginTop: 6 }}>
                      {dream.interpretation.mainThemes.map((t, i) => <span key={i} className="theme-tag">{t}</span>)}
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Emotional Tone:</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>{dream.interpretation.emotionalTone}</p>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Symbols:</strong>
                    {dream.interpretation.symbols.map((s, i) => (
                      <div key={i} className="symbol-item">
                        <span className="symbol-name">{s.symbol}</span>
                        <span className="symbol-meaning">{s.meaning}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Insight:</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>{dream.interpretation.personalInsight}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Guidance:</strong>
                    <p style={{ color: 'var(--accent-amber)', fontSize: '0.875rem', marginTop: 4 }}>{dream.interpretation.guidance}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
