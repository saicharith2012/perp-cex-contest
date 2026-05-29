import type { RequestHandler } from "express";
import {
  BALANCES,
  ORDERBOOKS,
  type CreateOrderInput,
} from "../store/engineStore";

export const createOrder: RequestHandler = (req, res) => {
  const { userId, symbol, side, type, price, quantity, leverage = 1 } =
    req.body as CreateOrderInput;

  const userBalance = BALANCES.get(userId);

  const margin = (price * quantity) / leverage;

  if (!ORDERBOOKS.get(symbol)) {
    ORDERBOOKS.set(symbol, {
      asks: [],
      bids: [],
    });
  }

  const orderbook = ORDERBOOKS.get(symbol)!;
  const asks = orderbook.asks;
  const bids = orderbook.bids;

  if (type === "limit") {
    if (side === "long") {
      if (!userBalance || userBalance.availableBalance < margin) {
        res.status(200).json({
          status: "rejected",
          reason: "insufficient margin",
          fills: [],
          remainingQuantity: 0,
          cancelledQuantity: quantity,
          margin: {
            locked: 0,
            used: 0,
            released: 0,
          },
        });
        return;
      }

      // lock the balance
      userBalance.availableBalance -= margin;
      userBalance.lockedMargin += margin;

      if (asks.length === 0) {
        const orderId = crypto.randomUUID();

        bids.push({
          orderId,
          userId,
          price,
          quantity,
          leverage,
        });

        res.status(200).json({
          orderId,
          status: "resting",
          fills: [],
          remainingQuantity: quantity,
          cancelledQuantity: 0,
          margin: {
            locked: margin,
            used: 0,
            released: 0,
          },
        });
        return;
      }
    }
  }
};
