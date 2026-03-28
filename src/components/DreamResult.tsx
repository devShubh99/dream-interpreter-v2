import React, { useState } from 'react';
import { Link2, Check, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Dream } from '../lib/types';

interface DreamResultProps {
  dream: Dream;
  onUpdate?: () => void;
  isPublicView?: boolean;
}

const DreamResult: React.FC<DreamResultProps> = ({ dream, onUpdate, isPublicView = false }) => {
  const [isShared, setIsShared] = useState(dream.is_shared);
  const [copied, setCopied] = useState(false);

  const interp = dream.interpretation;
  if (!interp) return null;

  const handleToggleShare = async () => {
    const newShared = !isShared;
    const { error } = await supabase
      .from('dreams')
      .update({ is_shared: newShared })
      .eq('id', dream.id);

    if (!error) {
      setIsShared(newShared);
      onUpdate?.();
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/shared/${dream.share_id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this dream interpretation?')) return;
    const { error } = await supabase
      .from('dreams')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', dream.id);

    if (error) {
      console.error('Delete Error:', error);
      alert(`Could not delete: ${error.message}`);
    } else {
      onUpdate?.();
    }
  };

  return (
    <div className="dream-result">
      <div className="dream-result-grid">
        {/* Themes */}
        <div className="card animate-slide-up stagger-1">
          <h3 className="card-header">✨ Main Themes</h3>
          <div className="theme-tags">
            {interp.mainThemes.map((theme, i) => (
              <span key={i} className="theme-tag">{theme}</span>
            ))}
          </div>
        </div>

        {/* Emotional Tone */}
        <div className="card animate-slide-up stagger-2">
          <h3 className="card-header">💫 Emotional Atmosphere</h3>
          <p className="insight-text">{interp.emotionalTone}</p>
        </div>

        {/* Symbols */}
        <div className="card animate-slide-up stagger-3">
          <h3 className="card-header">🔮 Dream Symbols</h3>
          {interp.symbols.map((sym, i) => (
            <div key={i} className="symbol-item">
              <span className="symbol-name">{sym.symbol}</span>
              <span className="symbol-meaning">{sym.meaning}</span>
            </div>
          ))}
        </div>

        {/* Personal Insight */}
        <div className="card animate-slide-up stagger-4">
          <h3 className="card-header">🌟 Personal Insight</h3>
          <p className="insight-text">{interp.personalInsight}</p>
        </div>

        {/* Guidance */}
        <div className="card guidance-card animate-slide-up stagger-5">
          <h3 className="card-header">🧭 Guidance for Reflection</h3>
          <p className="guidance-text">{interp.guidance}</p>
        </div>
      </div>

      {/* Share & Delete Controls */}
      {!isPublicView && (
        <div className="card">
          <div className="share-controls" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
            <label className="toggle">
              <input type="checkbox" checked={isShared} onChange={handleToggleShare} />
              <span className="toggle-slider" />
            </label>
            <span className="share-label">
              {isShared ? 'Shared publicly' : 'Private'}
            </span>

            {isShared && (
              <div className="copy-link-btn">
                {copied ? (
                  <span className="copied-toast"><Check size={14} /> Copied!</span>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={handleCopyLink}>
                    <Link2 size={14} /> Copy Link
                  </button>
                )}
              </div>
            )}

            <button className="btn btn-danger btn-sm" onClick={handleDelete} style={{ marginLeft: isShared ? 0 : 'auto' }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DreamResult;
