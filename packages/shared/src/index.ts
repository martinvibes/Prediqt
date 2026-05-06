export * from './networks';
export * from './deployments';
export * from './types';

import PredqCreditAbi from './abis/PredqCredit.json';
import RoomRegistryAbi from './abis/RoomRegistry.json';

export const ABIS = {
  PredqCredit: PredqCreditAbi,
  RoomRegistry: RoomRegistryAbi,
} as const;
