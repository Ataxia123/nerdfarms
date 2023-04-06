import { TAppSliceCreator, TAppStore } from "~~/services/store/storeTypes";

export type TExampleStuff = {
  tempStuff: Array<string>;
  setup: Array<string>;
};

export const defaultExampleStuff = (): TExampleStuff => {
  return {
    tempStuff: [],
    setup: [],
  };
};

export type TempSlice = {
  tempState: TExampleStuff;
  address: string;
  pid: string;
  setTempState: (newTempState: TExampleStuff) => void;
  setAddress: (newAddress: string) => void;
  setPID: (newPid: string) => void;
};

export const createTempSlice: TAppSliceCreator<TempSlice> = set => ({
  tempState: defaultExampleStuff(),
  address: "",
  pid: "",
  setTempState: (newValue: TExampleStuff): void =>
    set((state): TAppStore => {
      state.tempSlice.tempState = newValue;
      return state;
    }),
  setAddress: (newAddress: string): void =>
    set((state): TAppStore => {
      state.tempSlice.address = newAddress;
      return state;
    }),
  setPID: (newPID: string): void =>
    set((state): TAppStore => {
      state.tempSlice.pid = newPID;
      return state;
    }),
});
