export * from './networks';
export * from './deployments';
export * from './types';

import PredqCreditAbi from './abis/PredqCredit.json';
import RoomRegistryAbi from './abis/RoomRegistry.json';
import MarketFactoryAbi from './abis/MarketFactory.json';
import ForecastMarketAbi from './abis/ForecastMarket.json';

export const ABIS = {
  PredqCredit: PredqCreditAbi,
  RoomRegistry: RoomRegistryAbi,
  MarketFactory: MarketFactoryAbi,
  ForecastMarket: ForecastMarketAbi,
} as const;
