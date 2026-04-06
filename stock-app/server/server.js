require('dotenv').config();

const WebSocket = require('ws');

const PORT    = process.env.PORT || 8080;
const TOKEN   = process.env.FINNHUB_API_KEY;
const SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];

const stocks = {
  AAPL:  { name: 'Apple Inc.',      price: 182.52, dailyHigh: 185.30, dailyLow: 180.10, weekHigh52: 199.62, weekLow52: 164.08 },
  GOOGL: { name: 'Alphabet Inc.',   price: 141.80, dailyHigh: 143.10, dailyLow: 139.80, weekHigh52: 153.78, weekLow52: 115.83 },
  MSFT:  { name: 'Microsoft Corp.', price: 374.10, dailyHigh: 376.85, dailyLow: 370.40, weekHigh52: 420.82, weekLow52: 309.45 },
  TSLA:  { name: 'Tesla Inc.',      price: 248.50, dailyHigh: 252.30, dailyLow: 243.10, weekHigh52: 299.29, weekLow52: 138.80 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function updatePrice(symbol, newPrice) {
  const s   = stocks[symbol];
  s.price    = parseFloat(newPrice.toFixed(2));
  s.dailyHigh = Math.max(s.dailyHigh, s.price);
  s.dailyLow  = Math.min(s.dailyLow,  s.price);
}

function snapshot() {
  return {
    type: 'snapshot',
    mode: TOKEN ? 'live' : 'mock',
    data: SYMBOLS.map(sym => ({ symbol: sym, ...stocks[sym] })),
  };
}

function update() {
  return {
    type: 'update',
    data: SYMBOLS.map(sym => ({ symbol: sym, ...stocks[sym] })),
  };
}

// ── Live: Finnhub ─────────────────────────────────────────────────────────────
function connectFinnhub() {
  const ws = new WebSocket(`wss://ws.finnhub.io?token=${TOKEN}`);

  ws.on('open', () => {
    console.log('Finnhub connected');
    SYMBOLS.forEach(sym => ws.send(JSON.stringify({ type: 'subscribe', symbol: sym })));
  });

  ws.on('message', raw => {
    const msg = JSON.parse(raw);
    if (msg.type !== 'trade') return;
    msg.data?.forEach(trade => {
      if (stocks[trade.s]) updatePrice(trade.s, trade.p);
    });
  });

  ws.on('close', () => {
    console.warn('Finnhub closed — retrying in 5s');
    setTimeout(connectFinnhub, 5000);
  });

  ws.on('error', err => console.error('Finnhub error:', err.message));
}

// ── Mock: random price simulation ─────────────────────────────────────────────
function startMock() {
  console.log('No token — using mock prices');
  setInterval(() => {
    SYMBOLS.forEach(sym => {
      const delta = (Math.random() - 0.48) * stocks[sym].price * 0.003;
      updatePrice(sym, stocks[sym].price + delta);
    });
  }, 1200);
}

// ── Angular WebSocket server ──────────────────────────────────────────────────
const wss = new WebSocket.Server({ port: PORT });
console.log(`Server running on ws://localhost:${PORT}`);

wss.on('connection', ws => {
  console.log('Client connected');
  ws.send(JSON.stringify(snapshot()));

  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(update()));
    }
  }, 1200);

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});

// ── Boot ──────────────────────────────────────────────────────────────────────
TOKEN ? connectFinnhub() : startMock();