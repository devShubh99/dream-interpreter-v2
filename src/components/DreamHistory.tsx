import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import DreamResult from './DreamResult';
import type { Dream } from '../lib/types';

interface DreamHistoryProps {
  refreshKey: number;
}

const DreamHistory: React.FC<DreamHistoryProps> = ({ refreshKey }) => {
  const { session } = useAuth();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchDreams = async () => {
    if (!session) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('dreams')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!error && data) setDreams(data as Dream[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchDreams();
  }, [session, refreshKey]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="history-section">
        <h2 className="section-title">Dream Journal</h2>
        <div className="history-grid">
          <div className="card"><div className="shimmer shimmer-line" /><div className="shimmer shimmer-line" /><div className="shimmer shimmer-line" /></div>
          <div className="card"><div className="shimmer shimmer-line" /><div className="shimmer shimmer-line" /><div className="shimmer shimmer-line" /></div>
        </div>
      </div>
    );
  }

  if (dreams.length === 0) {
    return (
      <div className="history-section">
        <h2 className="section-title">Dream Journal</h2>
        <div className="empty-state">
          <div className="empty-state-icon">☁️</div>
          <p className="empty-state-text">No dreams yet. Describe your first dream above!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-section">
      <h2 className="section-title">Dream Journal</h2>

      <div className="history-grid">
        {dreams.map((dream) => (
          <div
            key={dream.id}
            className={`card history-card ${expandedId === dream.id ? 'history-card-expanded' : ''}`}
            onClick={() => setExpandedId(expandedId === dream.id ? null : dream.id)}
          >
            <span className="history-date">{formatDate(dream.created_at)}</span>
            <p className="history-preview-text">{dream.dream_text}</p>

            {/* Theme tags from interpretation */}
            {dream.interpretation?.mainThemes && (
              <div className="history-tags">
                {dream.interpretation.mainThemes.slice(0, 3).map((tag, i) => (
                  <span key={i} className="history-tag">{tag}</span>
                ))}
              </div>
            )}

            {dream.is_shared && <span className="badge badge-shared" style={{ marginTop: 8, display: 'inline-block' }}>Shared</span>}

            {expandedId === dream.id && (
              <div className="history-expanded" onClick={(e) => e.stopPropagation()}>
                <DreamResult dream={dream} onUpdate={fetchDreams} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DreamHistory;
