import { QuerySlice } from "./slices/querySlice";
import { StateCreator } from "zustand";
import { TEthPriceSlice } from "~~/services/store/slices/ethPriceSlice";
import { TFarmingPositionRequestSlice } from "~~/services/store/slices/farmingPositionRequestSlice";
import { TempSlice } from "~~/services/store/slices/tempSlice";

/**
 * The App store definition
 */
export type TAppStore = {
  tempSlice: TempSlice;
  ethPriceSlice: TEthPriceSlice;
  farmingPositionRequestSlice: TFarmingPositionRequestSlice;
  querySlice: QuerySlice;
  ethPrice: number;
  /**
   * Add more slices here
   */
};

/***
 * Helper to create slices
 */
export type TAppSliceCreator<TStateSlice> = StateCreator<TAppStore, [], [], TStateSlice>;
