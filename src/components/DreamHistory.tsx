import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { useFilter } from '../lib/FilterContext';
import DreamResult from './DreamResult';
import type { Dream } from '../lib/types';

interface DreamHistoryProps {
  refreshKey: number;
}

const DreamHistory: React.FC<DreamHistoryProps> = ({ refreshKey }) => {
  const { session } = useAuth();
  const { filterWord } = useFilter();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchDreams = async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    const { data, error: sbError } = await supabase
      .from('dreams')
      .select('*')
      .eq('user_id', session.user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (sbError) {
      console.error('Fetch Dreams Error:', sbError);
      setError(sbError.message);
    } else if (data) {
      setDreams(data as Dream[]);
    }
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

  if (error) {
    return (
      <div className="history-section animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <h2 className="section-title">📔 Your Dream Journal</h2>
        <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)', padding: '24px', textAlign: 'center' }}>
          <p style={{ color: '#ef4444', marginBottom: 12 }}>
            <strong>Error loading journal:</strong> {error}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Please ensure you've run the <strong>latest SQL update</strong> in the Supabase Editor to add the <code>deleted_at</code> column.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="history-section animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <h2 className="section-title">📔 Your Dream Journal</h2>
        <div className="history-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card shimmer-card">
              <div className="shimmer shimmer-line" style={{ width: '40%', marginBottom: 12 }} />
              <div className="shimmer shimmer-line" style={{ width: '90%', marginBottom: 8 }} />
              <div className="shimmer shimmer-line" style={{ width: '70%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (dreams.length === 0) {
    return (
      <div className="history-section">
        <h2 className="section-title">📔 Your Dream Journal</h2>
        <div className="empty-state">
          <div className="empty-state-icon">☁️</div>
          <p className="empty-state-text">No dreams yet. Describe your first dream above to start your journey! ✨</p>
        </div>
      </div>
    );
  }

  const filteredDreams = filterWord
    ? dreams.filter((d) => {
        const fullText = [
          ...(d.main_themes || []),
          ...(d.interpretation?.mainThemes || []),
          ...(d.interpretation?.symbols?.map(s => s.symbol) || [])
        ].join(' ').toLowerCase();
        return fullText.includes(filterWord.toLowerCase());
      })
    : dreams;

  const getSentimentColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'rgba(255, 255, 255, 0.05)';
    if (score <= 3) return '#7E22CE'; // Deep Purple (Shadow/Nightmare)
    if (score <= 5) return '#3B82F6'; // Nebula Blue (Heavy/Melancholy)
    if (score <= 7) return '#10B981'; // Emerald (Neutral/Aurora)
    if (score <= 9) return '#F59E0B'; // Amber (Inspired/Stellar)
    return '#FFFFFF'; // Pure White (Lucid/Transcendent)
  };

  return (
    <div className="history-section">
      <h2 className="section-title">Dream Journal</h2>

      <div className="history-grid">
        {filteredDreams.map((dream) => (
          <div
            key={dream.id}
            className={`card history-card ${expandedId === dream.id ? 'history-card-expanded' : ''}`}
            onClick={() => setExpandedId(expandedId === dream.id ? null : dream.id)}
            style={{ '--current-sentiment-color': getSentimentColor(dream.sentiment_score) } as React.CSSProperties}
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
