import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../store';
import {
  signupWithEmail,
  loginWithGoogle,
  clearError,
} from '../store/slices/authSlice';
import {resetOnboarding} from '../store/slices/onboardingSlice';
import {colors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {icons} from '../constant/icons';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {useNavigation} from '@react-navigation/native';
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {AccessToken, LoginManager} from 'react-native-fbsdk-next';
import {
  FacebookAuthProvider,
  getAuth,
  signInWithCredential,
} from '@react-native-firebase/auth';

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [warning, setWarning] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const {error} = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '320653206255-khvf38flfhoc11gsg1dq4togsikhoshs.apps.googleusercontent.com',
    });
  }, []);

  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(50);

  useEffect(() => {
    fadeIn.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.exp),
    });
    slideUp.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.exp),
    });
  }, [fadeIn, slideUp]);

  useEffect(() => {
    if (error) {
      setWarning(error);
    }
  }, [error]);

  const handleEmailChange = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (text && !emailRegex.test(text)) {
      setWarning('That email address is invalid!');
    } else {
      setWarning('');
      dispatch(clearError());
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (text.length > 0 && text.length < 6) {
      setWarning('Password must be at least 6 characters');
    } else if (confirmPassword && text !== confirmPassword) {
      setWarning('Passwords do not match');
    } else {
      setWarning('');
      dispatch(clearError());
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (text !== password) {
      setWarning('Passwords do not match');
    } else {
      setWarning('');
      dispatch(clearError());
    }
  };

  const handleSignup = async () => {
    if (!email) {
      setWarning('Please enter your email.');
      return;
    }

    if (!password) {
      setWarning('Please enter a password.');
      return;
    }

    if (password.length < 6) {
      setWarning('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setWarning('Passwords do not match.');
      return;
    }

    try {
      setIsEmailLoading(true);
      dispatch(resetOnboarding());
      await dispatch(signupWithEmail({email, password}));
    } catch (err) {
      console.error('Email signup error:', err);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsGoogleLoading(true);
      dispatch(resetOnboarding());
      await dispatch(loginWithGoogle());
    } catch (err) {
      console.error('Google signup error:', err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookSignup = async () => {
    try {
      setIsFacebookLoading(true);
      dispatch(resetOnboarding());

      const result = await LoginManager.logInWithPermissions([
        'public_profile',
      ]);

      if (result.isCancelled) {
        throw 'User cancelled the login process';
      }

      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        throw 'Something went wrong obtaining access token';
      }

      const facebookCredential = FacebookAuthProvider.credential(
        data.accessToken,
      );

      await signInWithCredential(getAuth(), facebookCredential);
    } catch (err) {
      console.error('Facebook signup error:', err);
    } finally {
      setIsFacebookLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
  };

  const isAnyLoading = isEmailLoading || isGoogleLoading || isFacebookLoading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeIn,
                transform: [{translateY: slideUp}],
              },
            ]}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to get started</Text>
            </View>

            {warning && (
              <View style={styles.errorView}>
                <Image
                  source={icons?.warning}
                  style={styles.errorIcon}
                  resizeMode="contain"
                  tintColor={colors.error}
                />
                <Text style={[styles.subtitle, styles.errorText]}>
                  {warning}
                </Text>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Image
                    source={icons?.email}
                    style={styles.inputIcon}
                    resizeMode="contain"
                  />
                  <TextInput
                    value={email}
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.black}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Image
                    style={styles.inputIcon}
                    resizeMode="contain"
                    source={icons?.lock}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.black}
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}>
                    <Image
                      style={styles.inputIcon}
                      source={showPassword ? icons.visible : icons.inVisible}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Image
                    style={styles.inputIcon}
                    resizeMode="contain"
                    source={icons?.lock}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.black}
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }>
                    <Image
                      style={styles.inputIcon}
                      source={
                        showConfirmPassword ? icons.visible : icons.inVisible
                      }
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  isAnyLoading && !isEmailLoading && styles.buttonDisabled,
                ]}
                onPress={handleSignup}
                disabled={isAnyLoading}>
                {isEmailLoading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.socialButton,
                    isAnyLoading && !isGoogleLoading && styles.buttonDisabled,
                  ]}
                  onPress={handleGoogleSignup}
                  disabled={isAnyLoading}>
                  {isGoogleLoading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <>
                      <Image
                        style={styles.socialIcon}
                        resizeMode="contain"
                        source={icons.google}
                        tintColor={colors.white}
                      />
                      <Text style={styles.buttonText}>
                        Continue with Google
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.socialButton,
                    styles.facebookButton,
                    isAnyLoading && !isFacebookLoading && styles.buttonDisabled,
                  ]}
                  onPress={handleFacebookSignup}
                  disabled={isAnyLoading}>
                  {isFacebookLoading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <>
                      <Image
                        style={styles.socialIcon}
                        resizeMode="contain"
                        source={icons.facebook}
                        tintColor={colors.white}
                      />
                      <Text style={styles.buttonText}>
                        Continue with Facebook
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text style={styles.linkText} onPress={navigateToLogin}>
                  Sign In
                </Text>
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(6.4),
    paddingBottom: hp(2),
  },
  header: {
    marginTop: hp(6),
    marginBottom: hp(3),
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize(32),
    fontFamily: fonts.black,
    color: colors.black,
    marginBottom: hp(0.98),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize(14),
    color: colors.black,
    textAlign: 'center',
    fontFamily: fonts.regular,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: hp(2.5),
  },
  inputLabel: {
    fontSize: fontSize(14),
    color: colors.black,
    marginBottom: hp(0.98),
    fontFamily: fonts.bold,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: colors.gold,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputIcon: {
    height: wp(4.26),
    width: wp(4.26),
    marginHorizontal: wp(2.66),
  },
  input: {
    flex: 1,
    padding: wp(4.26),
    paddingLeft: 0,
    fontSize: fontSize(14),
    color: colors.black,
    fontFamily: fonts.regular,
  },
  eyeIcon: {
    padding: wp(4.26),
  },
  button: {
    borderRadius: wp(3),
    padding: wp(4.26),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    flexDirection: 'row',
    marginTop: hp(2),
  },
  primaryButton: {
    backgroundColor: colors.black,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(3),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightGray,
  },
  dividerText: {
    marginHorizontal: wp(4.26),
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
  },
  socialButtonsContainer: {
    gap: hp(2),
  },
  socialButton: {
    backgroundColor: colors.gold,
    marginTop: 0,
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  socialIcon: {
    height: wp(5.33),
    width: wp(5.33),
    marginRight: wp(3),
  },
  footer: {
    paddingVertical: hp(4),
    alignItems: 'center',
    marginTop: hp(2),
    justifyContent: 'center',
  },
  footerText: {
    fontSize: fontSize(14),
    color: colors.black,
    textAlign: 'center',
    fontFamily: fonts.bold,
  },
  linkText: {
    color: colors.gold,
    fontFamily: fonts.bold,
    fontSize: fontSize(14),
  },
  errorText: {
    color: colors.error,
  },
  errorIcon: {
    height: wp(4.26),
    width: wp(4.26),
    marginRight: wp(2.66),
  },
  errorView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp(2.66),
  },
  googleIcon: {
    height: wp(5.33),
    width: wp(5.33),
  },
});

export default SignupScreen;
