import {configureStore} from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers} from 'redux';
import profileReducer, {ProfileState} from './slices/profileSlice';
import journalReducer, {JournalState} from './slices/journalSlice';
import premiumReducer, {PremiumState} from './slices/premiumSlice';
import promptReducer, {PromptState} from './slices/promptSlice';
import authReducer, {AuthState} from './slices/authSlice';
import onboardingReducer, {OnboardingState} from './slices/onboardingSlice';

export interface RootStatetype {
  profile: ProfileState;
  journal: JournalState;
  premium: PremiumState;
  prompt: PromptState;
  auth: AuthState;
  onboarding: OnboardingState;
}

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['profile', 'journal', 'premium', 'prompt', 'auth', 'onboarding'],
};

const rootReducer = combineReducers({
  profile: profileReducer,
  journal: journalReducer,
  premium: premiumReducer,
  prompt: promptReducer,
  auth: authReducer,
  onboarding: onboardingReducer,
});

const persistedReducer = persistReducer<RootStatetype>(
  persistConfig,
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          'auth/loginWithGoogle/pending',
          'auth/loginWithGoogle/fulfilled',
          'auth/loginWithGoogle/rejected',
          'auth/loginWithEmail/pending',
          'auth/loginWithEmail/fulfilled',
          'auth/loginWithEmail/rejected',
          'auth/signupWithEmail/pending',
          'auth/signupWithEmail/fulfilled',
          'auth/signupWithEmail/rejected',
          'auth/logout/pending',
          'auth/logout/fulfilled',
          'auth/logout/rejected',
        ],
        ignoredPaths: ['auth.user'],
      },
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;

export type RootState = ReturnType<typeof store.getState>;
