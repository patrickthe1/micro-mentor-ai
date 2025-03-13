import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';

/**
 * Main App component that serves as the entry point for the application
 * Assembles all the major sections of the application
 */
function App() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <Home />
      <Footer />
    </div>
  );
}

export default App;