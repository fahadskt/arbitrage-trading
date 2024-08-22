const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper function to introduce a delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Function to fetch the price of a given trading pair with retry logic
const fetchPrice = async (symbol, retries = 3) => {
  await delay(100);  // Introduce a small delay between requests to avoid hitting rate limits
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
    if (!response.data || !response.data.price) {
      throw new Error(`No price data for ${symbol}`);
    }
    return parseFloat(response.data.price);
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying to fetch price for ${symbol}... (${retries} retries left)`);
      await delay(1000);  // Wait 1 second before retrying
      return fetchPrice(symbol, retries - 1);
    } else {
      console.error(`Error fetching price for ${symbol}:`, error.message);
      throw error;
    }
  }
};

// Route to fetch all trading pairs and calculate potential arbitrage opportunities
app.get('/api/arbitrage', async (req, res) => {
  try {
    // Fetch all trading pairs from Binance
    const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
    const symbols = response.data.symbols;

    if (!symbols || symbols.length === 0) {
      throw new Error('No trading pairs found');
    }

    const opportunities = [];
    const logs = [];

    // Iterate through the symbols to find triangular arbitrage opportunities
    for (let i = 0; i < symbols.length; i++) {
      for (let j = i + 1; j < symbols.length; j++) {
        for (let k = j + 1; k < symbols.length; k++) {
          const pair1 = symbols[i].symbol;
          const pair2 = symbols[j].symbol;
          const pair3 = symbols[k].symbol;

          logs.push(`Processing: ${pair1}, ${pair2}, ${pair3}`);

          try {
            // Fetch prices for each pair
            const [price1, price2, price3] = await Promise.all([
              fetchPrice(pair1),
              fetchPrice(pair2),
              fetchPrice(pair3),
            ]);

            // Calculate triangular arbitrage opportunities
            const opportunity = calculateTriangularArbitrage(price1, price2, price3, pair1, pair2, pair3);
            if (opportunity) opportunities.push(opportunity);
          } catch (error) {
            console.error(`Error processing pairs ${pair1}, ${pair2}, ${pair3}:`, error.message);
            logs.push(`Error processing pairs ${pair1}, ${pair2}, ${pair3}: ${error.message}`);
          }
        }
      }
    }

    // Send the opportunities and logs as the response
    res.json({ opportunities, logs });
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send('Server error');
  }
});

// Function to calculate triangular arbitrage opportunities
const calculateTriangularArbitrage = (price1, price2, price3, pair1, pair2, pair3) => {
  // Example logic for calculating arbitrage
  const opportunity1 = (price1 / price2) * price3;
  const opportunity2 = (price2 / price3) * price1;

  if (opportunity1 > 1) {
    return {
      buy: `${pair1} -> ${pair2} -> ${pair3}`,
      profit: ((opportunity1 - 1) * 100).toFixed(2) + ' %',
    };
  }
  if (opportunity2 > 1) {
    return {
      buy: `${pair2} -> ${pair3} -> ${pair1}`,
      profit: ((opportunity2 - 1) * 100).toFixed(2) + ' %',
    };
  }
  return null;
};

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
