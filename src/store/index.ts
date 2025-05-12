import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import profileReducer, { ProfileState } from './slices/profileSlice';
import journalReducer, { JournalState } from './slices/journalSlice';
import premiumReducer, { PremiumState } from './slices/premiumSlice';
import promptReducer, { PromptState } from './slices/promptSlice';

export interface RootState {
  profile: ProfileState;
  journal: JournalState;
  premium: PremiumState;
  prompt: PromptState;
}

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['profile', 'journal', 'premium', 'prompt'],
};

const rootReducer = combineReducers({
  profile: profileReducer,
  journal: journalReducer,
  premium: premiumReducer,
  prompt: promptReducer,
});

const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch; 