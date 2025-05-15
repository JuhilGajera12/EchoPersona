import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Firebase imports (commented out until Firebase is set up)
// import { 
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   signOut,
//   deleteUser,
//   signInWithPopup,
//   GoogleAuthProvider,
//   FacebookAuthProvider
// } from 'firebase/auth';
// import { auth } from '../firebase/config';

export interface AuthState {
  user: any | null;
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

// Async thunks for Firebase auth (commented out)
export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async ({ email, password }: { email: string; password: string }) => {
    // const result = await signInWithEmailAndPassword(auth, email, password);
    // return result.user;
    
    // Temporary mock for testing
    return { uid: '123', email, displayName: 'Test User' };
  }
);

export const signupWithEmail = createAsyncThunk(
  'auth/signupWithEmail',
  async ({ email, password }: { email: string; password: string }) => {
    // const result = await createUserWithEmailAndPassword(auth, email, password);
    // return result.user;
    
    // Temporary mock for testing
    return { uid: '123', email, displayName: 'Test User' };
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async () => {
    // const provider = new GoogleAuthProvider();
    // const result = await signInWithPopup(auth, provider);
    // return result.user;
    
    // Temporary mock for testing
    return { uid: '123', email: 'test@gmail.com', displayName: 'Google User' };
  }
);

export const loginWithFacebook = createAsyncThunk(
  'auth/loginWithFacebook',
  async () => {
    // const provider = new FacebookAuthProvider();
    // const result = await signInWithPopup(auth, provider);
    // return result.user;
    
    // Temporary mock for testing
    return { uid: '123', email: 'test@facebook.com', displayName: 'Facebook User' };
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    // await signOut(auth);
    return null;
  }
);

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async () => {
    // if (auth.currentUser) {
    //   await deleteUser(auth.currentUser);
    // }
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login with email
      .addCase(loginWithEmail.pending, (state) => {
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
        state.error = action.error.message || 'Login failed';
      })
      
      // Signup with email
      .addCase(signupWithEmail.pending, (state) => {
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
        state.error = action.error.message || 'Signup failed';
      })
      
      // Google login
      .addCase(loginWithGoogle.pending, (state) => {
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
        state.error = action.error.message || 'Google login failed';
      })
      
      // Facebook login
      .addCase(loginWithFacebook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithFacebook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginWithFacebook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Facebook login failed';
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      
      // Delete account
      .addCase(deleteAccount.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer; 