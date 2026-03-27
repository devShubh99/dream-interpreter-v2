import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Moon, LogOut, BookOpen } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

const NavBar: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!session) return null;
  const displayName = session.user.user_metadata?.username || 'dreamer';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand" onClick={() => navigate('/dashboard')}>
          <Moon size={22} />
          Dream Interpreter
        </div>
        <div className="navbar-links">
          <button className={`navbar-link ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>
            <Moon size={14} style={{ marginRight: 4 }} />
            My Dreams
          </button>
          <button className={`navbar-link ${location.pathname === '/dream-book' ? 'active' : ''}`} onClick={() => navigate('/dream-book')}>
            <BookOpen size={14} style={{ marginRight: 4 }} />
            Dream Book
          </button>
          <div className="navbar-user-badge">
            <img src={`https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${displayName}`} alt="avatar" className="navbar-avatar" />
            <span>{displayName}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleSignOut} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
