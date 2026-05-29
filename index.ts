import express from "express";
import { BALANCES, ORDERBOOKS, POSITIONS, USERS } from "./store/engineStore";
import { createOrder } from "./controllers/createOrder";

const app = express();

app.use(express.json());

ORDERBOOKS.set("BTC-PERP", {
  bids: [],
  asks: [],
});

app.get("/", (req, res) => {
  res.json({
    message: "hello from perps-cex",
  });
});

// reset
app.post("/api/reset", (req, res) => {
  USERS.clear();
  BALANCES.clear();
  ORDERBOOKS.clear();
  POSITIONS.clear();

  console.log(USERS);

  res.status(200).json({
    ok: true,
  });
});

// create user
app.post("/api/users", (req, res) => {
  try {
    const { userId, initialBalance } = req.body;

    if (USERS.get(userId)) {
      res.status(409).json({
        error: "user alrady exists.",
      });
    }

    USERS.set(userId, { userId });
    BALANCES.set(userId, {
      userId,
      availableBalance: initialBalance,
      lockedMargin: 0,
      totalEquity: 0,
      realizedPnl: 0,
    });

    POSITIONS.set(userId, []);

    console.log(USERS);

    res.status(200).json({
      userId,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "internal server error",
    });
  }
});

// get orderbook
app.get("/api/orderbook/:symbol", (req, res) => {
  try {
    const symbol = req.params.symbol;

    const orderbook = ORDERBOOKS.get(symbol);

    if (!orderbook) {
      res.json({
        error: "orderbook not found.",
      });
      return;
    }

    res.status(200).json({
      symbol,
      bids: orderbook?.bids,
      asks: orderbook?.asks,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

// get user balance
app.get("/api/users/:userid/balance", (req, res) => {
  const userId = req.params.userid;

  const balance = BALANCES.get(userId);

  if (!balance) {
    res.status(404).json({
      error: "balance not found.",
    });

    return;
  }

  res.status(200).json(balance);
});

// place order
app.post("/api/orders", createOrder);

// get user position
app.get("/api/users/:userId/positions", (req, res) => {
  try {
    const userId = req.params.userId;

    const positions = POSITIONS.get(userId) ?? [];

    res.status(200).json({
      userId,
      positions,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

app.listen(3000, () => {
  console.log(`server listening on port 3000...`);
});
