import express from 'express';
import cors from 'cors';
import { db } from './firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// Helper to check if cache is fresh (updated today)
const isCacheFresh = (timestamp) => {
  if (!timestamp) return false;
  const today = new Date().toISOString().split('T')[0];
  const cacheDate = new Date(timestamp).toISOString().split('T')[0];
  return today === cacheDate;
};

// --- Taiwan Stock Price Endpoint ---
app.get('/api/finmind/price/:id', async (req, res) => {
  const { id } = req.params;
  const { finmindKey, startStr, todayStr } = req.query;

  try {
    // 1. Check Firebase Cache
    const docRef = doc(db, 'stockPrices', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (isCacheFresh(data.updatedAt)) {
        console.log(`[Cache Hit] Firebase returned data for ${id}`);
        return res.json({ source: 'firebase', data: data.payload });
      }
    }

    // 2. Fetch from FinMind API if cache miss or stale
    console.log(`[Cache Miss] Fetching FinMind API for ${id}`);
    const url = `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=${id}&start_date=${startStr}&end_date=${todayStr}${finmindKey ? `&token=${finmindKey}` : ''}`;
    
    const response = await fetch(url);
    const result = await response.json();

    if (result.msg === 'success' && result.data && result.data.length > 0) {
      // 3. Save to Firebase Cache
      await setDoc(docRef, {
        updatedAt: new Date().toISOString(),
        payload: result
      });
      console.log(`[Cache Saved] Data saved to Firebase for ${id}`);
    }

    res.json({ source: 'api', data: result });
  } catch (error) {
    console.error('Error fetching stock price:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Taiwan Stock News Endpoint ---
app.get('/api/finmind/news/:id', async (req, res) => {
  const { id } = req.params;
  const { finmindKey, startStr } = req.query;

  try {
    const docRef = doc(db, 'stockNews', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Cache news for 6 hours
      const cacheAgeHours = (Date.now() - new Date(data.updatedAt).getTime()) / (1000 * 60 * 60);
      if (cacheAgeHours < 6) {
        console.log(`[Cache Hit] Firebase returned news for ${id}`);
        return res.json({ source: 'firebase', data: data.payload });
      }
    }

    console.log(`[Cache Miss] Fetching FinMind News API for ${id}`);
    const url = `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockNews&data_id=${id}&start_date=${startStr}${finmindKey ? `&token=${finmindKey}` : ''}`;
    
    const response = await fetch(url);
    const result = await response.json();

    if (result.msg === 'success' && result.data) {
      await setDoc(docRef, {
        updatedAt: new Date().toISOString(),
        payload: result
      });
      console.log(`[Cache Saved] News saved to Firebase for ${id}`);
    }

    res.json({ source: 'api', data: result });
  } catch (error) {
    console.error('Error fetching stock news:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
