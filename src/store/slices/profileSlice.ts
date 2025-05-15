import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface PersonaProfile {
  summary: string;
  traits: string[];
  lastUpdated: string;
}

interface HistoricalProfile {
  summary: string;
  traits: string[];
  timestamp: string;
}

export interface ProfileState {
  currentProfile: PersonaProfile | null;
  historicalProfiles: HistoricalProfile[];
}

const initialState: ProfileState = {
  currentProfile: null,
  historicalProfiles: [],
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setCurrentProfile: (state, action: PayloadAction<PersonaProfile>) => {
      state.currentProfile = action.payload;
    },
    addHistoricalProfile: (state, action: PayloadAction<HistoricalProfile>) => {
      state.historicalProfiles.unshift(action.payload);
      if (state.historicalProfiles.length > 10) {
        state.historicalProfiles = state.historicalProfiles.slice(0, 10);
      }
    },
    clearProfile: state => {
      state.currentProfile = null;
      state.historicalProfiles = [];
    },
  },
});

export const {setCurrentProfile, addHistoricalProfile, clearProfile} =
  profileSlice.actions;
export default profileSlice.reducer;
