import React from 'react';
import NavBar from './NavBar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-layout">
      <div className="bg-effects">
        <div className="stars" />
      </div>
      <NavBar />
      <div className="page-container">
        {children}
      </div>
    </div>
  );
};

export default Layout;
