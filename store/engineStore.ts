export type OrderStatus =
  | "resting"
  | "filled"
  | "partially_filled"
  | "cancelled"
  | "rejected";
export type Side = "short" | "long";

export type User = {
  userId: string;
};

export type Order = {
  orderId: string;
  userId: string;
  price: number;
  quantity: number;
  leverage: number;
};

export type Orderbook = {
  asks: Order[];
  bids: Order[];
};

export type Collateral = {
  userId: string;
  availableBalance: number;
  lockedMargin: number;
  totalEquity: number;
  realizedPnl: number;
};

export type Position = {
  userId: string;
  symbol: string;
  side: Side;
  margin: number;
  averageEntryPrice: number;
  quantity: number;
  liquidationPrice: number;
  unrealizedPnL?: number;
};

export type Fill = {
  price: number;
  quantity: number;
  makerOrderId: string;
  takerUserId: string;
  makerUserId: string;
};

export const USERS = new Map<string, User>(); // userId as key
export const ORDERBOOKS = new Map<string, Orderbook>(); // symbol as key
export const BALANCES = new Map<string, Collateral>(); //userId as key
export const POSITIONS = new Map<string, Position[]>(); // userId as key, marketId as key
export const FILLS: Fill[] = [];

// types

export type CreateOrderInput = {
  userId: string;
  symbol: string;
  side: Side;
  type: "limit" | "market";
  price: number;
  quantity: number;
  leverage: number;
  postOnly: boolean;
  clientOrderId?: string;
};

export type createOrderResponse = {
  orderId: string;
  status: OrderStatus;
  reason: string;
  fills: Fill[];
  remainingQuantity: number;
  cancelledQuantity: number;
  margin: {
    locked: number;
    used: number;
    released: number;
  };
};
