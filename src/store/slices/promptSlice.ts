import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PromptState {
  currentPrompt: string;
  promptHistory: string[];
}

const initialState: PromptState = {
  currentPrompt: '',
  promptHistory: [],
};

const promptSlice = createSlice({
  name: 'prompt',
  initialState,
  reducers: {
    setCurrentPrompt: (state, action: PayloadAction<string>) => {
      state.currentPrompt = action.payload;
      state.promptHistory.unshift(action.payload);
      // Keep only last 10 prompts
      if (state.promptHistory.length > 10) {
        state.promptHistory = state.promptHistory.slice(0, 10);
      }
    },
    clearPromptHistory: (state) => {
      state.currentPrompt = '';
      state.promptHistory = [];
    },
  },
});

export const { setCurrentPrompt, clearPromptHistory } = promptSlice.actions;
export default promptSlice.reducer; 