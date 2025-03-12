import { OpenAI } from 'openai';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize OpenAI with API key
// Note: In a production app, this should be stored securely and not hard-coded
const OPENAI_API_KEY = 'your-openai-api-key'; // Replace with your actual key or use environment variables

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Cache for forecasts to avoid unnecessary API calls
const FORECAST_CACHE_KEY = 'forecast_cache';
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get a transaction forecast using the OpenAI API
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} - Prediction object with predictedChange
 */
export const getAIForecast = async (transactions) => {
  try {
    // Check if we have a valid cached forecast
    const cachedForecast = await getCachedForecast(transactions);
    if (cachedForecast) {
      console.log('Using cached forecast');
      return cachedForecast;
    }

    // Prepare data for analysis
    const recentTransactions = transactions.slice(0, 20); // Use only the most recent transactions
    
    // Calculate current financial metrics
    const totalBalance = calculateTotalBalance(transactions);
    const { income, expenses } = calculateWeeklyFinances(transactions);
    
    // Format transaction data for the AI
    const formattedTransactions = recentTransactions.map(t => {
      return {
        date: t.date,
        amount: t.amount,
        type: t.type,
        category: t.category,
        name: t.name
      };
    });

    // Create prompt for the AI
    const prompt = `
      I need a financial forecast based on the following information:
      
      Current balance: $${totalBalance.toFixed(2)}
      Weekly income: $${income.toFixed(2)}
      Weekly expenses: $${expenses.toFixed(2)}
      
      Recent transactions (most recent first):
      ${JSON.stringify(formattedTransactions, null, 2)}
      
      Based on this financial data, please provide:
      1. A predicted change in balance for next week (a single number, positive or negative)
      2. A very brief explanation of the prediction (2-3 words maximum)
      
      Format your response as valid JSON with two fields:
      - predictedChange: a number (e.g., 125.75 or -42.30)
      - explanation: a string (e.g., "Increased expenses" or "Income boost")
      
      Only return the JSON object, nothing else.
    `;

    console.log('Sending request to OpenAI');
    
    // Make the API call to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a financial analysis assistant that provides forecasts based on transaction data. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 150
    });

    // Extract and parse the response
    const aiResponse = response.choices[0].message.content.trim();
    let prediction;
    
    try {
      prediction = JSON.parse(aiResponse);
      
      // Ensure the response has the expected format
      if (!('predictedChange' in prediction)) {
        prediction = { predictedChange: 0, explanation: "Default prediction" };
      }
      
      // Cache the forecast
      await cacheForecast(transactions, prediction);
      
      return prediction;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      // Return a default prediction
      return { predictedChange: 0, explanation: "Parsing error" };
    }
  } catch (error) {
    console.error('Error getting AI forecast:', error);
    // Return a default prediction in case of error
    return { predictedChange: 0, explanation: "Error occurred" };
  }
};

/**
 * Calculate total balance from transactions
 */
const calculateTotalBalance = (transactions) => {
  return transactions.reduce((total, t) => {
    const amount = t.amount || 0;
    return t.type === 'income' ? total + amount : total - amount;
  }, 0);
};

/**
 * Calculate weekly income and expenses
 */
const calculateWeeklyFinances = (transactions) => {
  // Get transactions from the last 7 days
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  let income = 0;
  let expenses = 0;
  
  transactions.forEach(t => {
    if (!t.date) return;
    
    // Parse date in format DD/MM/YY
    const [day, month, year] = t.date.split('/').map(Number);
    const transactionDate = new Date(2000 + year, month - 1, day);
    
    if (transactionDate >= oneWeekAgo) {
      if (t.type === 'income') {
        income += t.amount || 0;
      } else {
        expenses += t.amount || 0;
      }
    }
  });
  
  return { income, expenses };
};

/**
 * Get a cached forecast if it exists and is valid
 */
const getCachedForecast = async (transactions) => {
  try {
    const cacheJson = await AsyncStorage.getItem(FORECAST_CACHE_KEY);
    if (!cacheJson) return null;
    
    const cache = JSON.parse(cacheJson);
    const now = new Date().getTime();
    
    // Check if cache is expired
    if (now - cache.timestamp > CACHE_EXPIRATION) {
      console.log('Cache expired');
      return null;
    }
    
    // Simple validation - if transaction count is drastically different, invalidate cache
    if (Math.abs(cache.transactionCount - transactions.length) > 3) {
      console.log('Transaction count changed significantly');
      return null;
    }
    
    return cache.forecast;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
};

/**
 * Cache a forecast for future use
 */
const cacheForecast = async (transactions, forecast) => {
  try {
    const cacheData = {
      forecast,
      timestamp: new Date().getTime(),
      transactionCount: transactions.length
    };
    
    await AsyncStorage.setItem(FORECAST_CACHE_KEY, JSON.stringify(cacheData));
    console.log('Forecast cached successfully');
  } catch (error) {
    console.error('Error caching forecast:', error);
  }
};