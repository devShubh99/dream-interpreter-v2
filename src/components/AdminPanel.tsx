import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Dream } from '../lib/types';

const AdminPanel: React.FC = () => {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      const { data, error: sbError } = await supabase
        .from('dreams')
        .select('*')
        .order('created_at', { ascending: false });

      if (sbError) {
        console.error('Admin Fetch Error:', sbError);
        setError(sbError.message);
      } else if (data) {
        setDreams(data as Dream[]);
      }
      setLoading(false);
    };
    fetchAll();
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
        All dream interpretations in the system ({dreams.length} total, including deleted)
      </p>

      {error ? (
        <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <p style={{ color: '#ef4444', textAlign: 'center' }}>
            <strong>Error loading dreams:</strong> {error}
            <br />
            <small style={{ opacity: 0.8 }}>Check your Supabase RLS policies and admin email.</small>
          </p>
        </div>
      ) : loading ? (
        <div className="card"><div className="shimmer shimmer-line" /><div className="shimmer shimmer-line" /><div className="shimmer shimmer-line" /></div>
      ) : dreams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p className="empty-state-text">No dreams found in the database.</p>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {dream.deleted_at && (
                    <span style={{ 
                      fontSize: '0.65rem', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      textTransform: 'uppercase',
                      fontWeight: 700
                    }}>
                      Deleted
                    </span>
                  )}
                  <span style={{ 
                    fontSize: '0.65rem', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    background: dream.is_shared ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: dream.is_shared ? '#10b981' : 'var(--text-muted)',
                    border: `1px solid ${dream.is_shared ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
                    textTransform: 'uppercase',
                    fontWeight: 600
                  }}>
                    {dream.is_shared ? 'Public' : 'Private'}
                  </span>
                  <span style={{ fontSize: '0.85rem' }}>{formatDate(dream.created_at)}</span>
                </div>
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
                  {dream.deleted_at && (
                    <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
                      <strong style={{ color: '#ef4444', fontSize: '0.75rem' }}>User Deleted On:</strong>
                      <p style={{ color: 'var(--text)', fontSize: '0.875rem', marginTop: 2 }}>{formatDate(dream.deleted_at)}</p>
                    </div>
                  )}
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
