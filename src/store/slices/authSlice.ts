import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {LoginManager} from 'react-native-fbsdk-next';
import {commonAction} from '../../helpers/globalFunction';
import {RootState} from '../../store';

export interface AuthState {
  user: {
    uid: string | null;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    phoneNumber: string | null;
    emailVerified: boolean;
    providerId: string | null;
  } | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async (
    {email, password}: {email: string; password: string},
    {rejectWithValue},
  ) => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      const user = userCredential.user;
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        providerId: user.providerId,
      };
    } catch (error: any) {
      let errorMessage = 'Failed to sign in';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Wrong password. Please try again.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'That email address is invalid.';
      }
      return rejectWithValue(errorMessage);
    }
  },
);

export const signupWithEmail = createAsyncThunk(
  'auth/signupWithEmail',
  async (
    {email, password}: {email: string; password: string},
    {rejectWithValue},
  ) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      const user = userCredential.user;
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        providerId: user.providerId,
      };
    } catch (error: any) {
      let errorMessage = 'Failed to sign up';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Try logging in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'That email address is invalid.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }
      return rejectWithValue(errorMessage);
    }
  },
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, {rejectWithValue}) => {
    try {
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      await GoogleSignin.signOut();

      const signInResult = await GoogleSignin.signIn();

      const idToken = signInResult?.data?.idToken;
      if (!idToken) {
        throw new Error('Failed to get ID token from Google Sign In');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );

      const user = userCredential.user;
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        providerId: user.providerId,
      };
    } catch (error: any) {
      let errorMessage = 'Google sign-in failed. Please try again.';

      if (error.code === 'SIGN_IN_CANCELLED') {
        errorMessage = 'Google sign-in was cancelled.';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorMessage = 'Google Play Services not available or outdated.';
      } else if (
        error.code === 10 ||
        error.message?.includes('DEVELOPER_ERROR')
      ) {
        errorMessage =
          'Google sign-in configuration error. Please ensure your SHA-1 fingerprint is correctly set up in Firebase Console.';
      } else if (error.code === 'SIGN_IN_REQUIRED') {
        errorMessage = 'Google sign-in is required but not completed.';
      } else if (error.code === 'IN_PROGRESS') {
        errorMessage = 'Google sign-in is already in progress.';
      }

      return rejectWithValue(errorMessage);
    }
  },
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, {rejectWithValue, getState}) => {
    try {
      const state = getState() as RootState;
      const providerId = state.auth.user?.providerId;

      if (providerId === 'facebook.com') {
        LoginManager.logOut();
      } else if (providerId === 'google.com') {
        await GoogleSignin.signOut();
      }

      await auth().signOut();
      return null;
    } catch (error: any) {
      return rejectWithValue('Failed to log out. Please try again.');
    }
  },
);

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (_, {rejectWithValue, getState}) => {
    try {
      const state = getState() as RootState;
      const providerId = state.auth.user?.providerId;

      if (providerId === 'facebook.com') {
        return rejectWithValue(
          'Account deletion is not available for Facebook accounts',
        );
      }

      const currentUser = auth().currentUser;
      if (currentUser) {
        await currentUser.delete();
      }
      return null;
    } catch (error: any) {
      return rejectWithValue('Failed to delete account. Please try again.');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setUser: (state, action) => {
      if (action.payload) {
        const user = action.payload;
        state.user = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
          emailVerified: user.emailVerified,
          providerId: user.providerId,
        };
      } else {
        state.user = null;
      }
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginWithEmail.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Login failed';
      })

      .addCase(signupWithEmail.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupWithEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signupWithEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Signup failed';
      })

      .addCase(loginWithGoogle.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Google login failed';
      })

      .addCase(logout.pending, state => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, state => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Logout failed';
      })

      .addCase(deleteAccount.pending, state => {
        state.isLoading = true;
      })
      .addCase(deleteAccount.fulfilled, state => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Delete account failed';
      });
  },
});

export const {clearError, setUser} = authSlice.actions;
export default authSlice.reducer;
