import React from 'react';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Odin Valhalla Rising Planner' }) => {
  return (
    <header style={{ 
      background: "linear-gradient(to right, #1f2937, #344055)",
      padding: "1rem 0",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 1rem"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h1 style={{ 
            fontSize: "1.5rem", 
            fontWeight: "bold", 
            color: "#dca54c" 
          }}>{title}</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;