import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleBegin = () => {
    navigate('/space-craft/design');
  };

  return (
    <div style={{ textAlign: 'left', padding: '20px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Hats That Look Like Earth</h1>
      <p style={{ fontSize: '1rem', marginBottom: '20px' }}>
        Knit a hat that looks like Earth. 
        Begin by designing your hat, then render it, and finally generate the pattern.
      </p>
      <button
        style={{
          backgroundColor: '#3f51b5',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={handleBegin}
      >
        Begin
      </button>
    </div>
  );
};

export default Home;