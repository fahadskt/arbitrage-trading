import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Arbitrage.css';

const Arbitrage = () => {
  const [opportunities, setOpportunities] = useState([]);  // Initialize as an empty array
  const [logs, setLogs] = useState([]);  // Initialize as an empty array

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/arbitrage');
        const { opportunities, logs } = response.data;

        setOpportunities(opportunities || []);  // Fallback to empty array if undefined
        setLogs(logs || []);  // Fallback to empty array if undefined
      } catch (error) {
        console.error('Error fetching opportunities:', error);
        setLogs(logs => [...logs, 'Error fetching data']);
      }
    };

    fetchOpportunities();
  }, []);

  return (
    <div className="arbitrage-container">
      <h1>Arbitrage Opportunities</h1>
      <ul>
        {opportunities.length > 0 ? (
          opportunities.map((opportunity, index) => (
            <li key={index}>
              Arbitrage: {opportunity.buy} - Potential Profit: {opportunity.profit}
            </li>
          ))
        ) : (
          <li>No arbitrage opportunities available at this time.</li>
        )}
      </ul>
      <h2>Processing Logs</h2>
      <div className="logs">
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <p key={index}>{log}</p>
          ))
        ) : (
          <p>No logs available.</p>
        )}
      </div>
    </div>
  );
};

export default Arbitrage;
