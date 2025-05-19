import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface JournalEntry {
  prompt: string;
  response: string;
  timestamp: string;
  recordingUri?: string;
  recordingDuration?: number;
}

export interface JournalState {
  entries: JournalEntry[];
}

const initialState: JournalState = {
  entries: [],
};

const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    addEntry: (state, action: PayloadAction<JournalEntry>) => {
      state.entries.unshift(action.payload);
    },
    deleteEntry: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter(entry => entry.timestamp !== action.payload);
    },
    clearEntries: (state) => {
      state.entries = [];
    },
  },
});

export const { addEntry, deleteEntry, clearEntries } = journalSlice.actions;
export default journalSlice.reducer; 