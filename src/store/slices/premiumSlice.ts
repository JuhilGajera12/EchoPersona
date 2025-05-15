import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface PremiumState {
  isPremium: boolean;
}

const initialState: PremiumState = {
  isPremium: false,
};

const premiumSlice = createSlice({
  name: 'premium',
  initialState,
  reducers: {
    setPremiumStatus: (state, action: PayloadAction<boolean>) => {
      state.isPremium = action.payload;
    },
    clearSubscription: state => {
      state.isPremium = false;
    },
  },
});

export const {setPremiumStatus, clearSubscription} = premiumSlice.actions;
export default premiumSlice.reducer;
