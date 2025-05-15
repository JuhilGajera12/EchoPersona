import {createSlice} from '@reduxjs/toolkit';

export interface OnboardingState {
  hasCompletedOnboarding: boolean;
}

const initialState: OnboardingState = {
  hasCompletedOnboarding: false,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    completeOnboarding: state => {
      state.hasCompletedOnboarding = true;
    },
    resetOnboarding: state => {
      state.hasCompletedOnboarding = false;
    },
  },
});

export const {completeOnboarding, resetOnboarding} = onboardingSlice.actions;
export default onboardingSlice.reducer;
