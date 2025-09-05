import React from 'react';

const Header = () => {
  return (
    <header style={{ 
      textAlign: 'center', 
      padding: '40px 20px',
      color: 'white'
    }}>
      <h1 style={{ 
        fontSize: '3rem', 
        marginBottom: '10px',
        fontWeight: '700',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}>
        🎤 Speak Easy
      </h1>
      <p style={{ 
        fontSize: '1.2rem', 
        opacity: 0.9,
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        Convert your speech to text using Azure Cognitive Services
      </p>
    </header>
  );
};

export default Header;
