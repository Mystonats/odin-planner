import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer style={{
      backgroundColor: "#1f2937",
      color: "#e5e7eb",
      padding: "0.75rem 0",
      boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
      marginTop: "auto"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 1rem"
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.875rem"
        }}>
          <p>Odin Valhalla Rising Schedule Planner &copy; {currentYear}</p>
          <p style={{ marginTop: "0.5rem" }}>
            Not affiliated with Kakao Games or Lionheart Studio
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;