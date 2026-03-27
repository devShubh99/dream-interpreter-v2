import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import type { DreamInterpretation } from '../lib/types';

interface DreamInputProps {
  onDreamSaved: () => void;
}

const DreamInput: React.FC<DreamInputProps> = ({ onDreamSaved }) => {
  const { session } = useAuth();
  const [dreamText, setDreamText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInterpret = async () => {
    if (!dreamText.trim() || !session) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/.netlify/functions/interpret-dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamText: dreamText.trim() }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to interpret dream');
      }

      const interpretation: DreamInterpretation = await response.json();

      const { error: dbError } = await supabase.from('dreams').insert({
        user_id: session.user.id,
        user_email: session.user.user_metadata?.username || null,
        dream_text: dreamText.trim(),
        interpretation,
      });

      if (dbError) throw dbError;

      setDreamText('');
      onDreamSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dream-input-section">
      <div className="card dream-input-card">
        <h2 className="dream-input-title">What did you dream about?</h2>

        <div className="input-group">
          <textarea
            id="dream-textarea"
            className="input dream-textarea"
            placeholder="☁ Describe your dream in as much detail as you can remember..."
            value={dreamText}
            onChange={(e) => setDreamText(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={handleInterpret}
          disabled={isLoading || !dreamText.trim()}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
              Interpreting your dream...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Interpret My Dream
            </>
          )}
        </button>

        {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}
      </div>
    </div>
  );
};

export default DreamInput;
