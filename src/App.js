import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Arbitrage from './components/Arbitrage/Arbitrage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Arbitrage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
  