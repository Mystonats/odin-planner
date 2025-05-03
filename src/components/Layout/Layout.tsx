import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      backgroundColor: "#f3f4f6"
    }}>
      <Header />
      <main style={{
        flexGrow: 1,
        width: "100%",
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "1.5rem 1rem"
      }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;