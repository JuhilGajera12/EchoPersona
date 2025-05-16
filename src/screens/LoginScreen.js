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
} from 'react-native';
import {colors} from '../constant/colors';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {fonts} from '../constant/fonts';
import {icons} from '../constant/icons';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useNavigation} from '@react-navigation/native';
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useDispatch, useSelector} from 'react-redux';
import {
  loginWithEmail,
  loginWithGoogle,
  clearError,
} from '../store/slices/authSlice';
import {AccessToken, LoginManager, Settings} from 'react-native-fbsdk-next';
import {
  FacebookAuthProvider,
  getAuth,
  signInWithCredential,
} from '@react-native-firebase/auth';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [warning, setWarning] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {error} = useSelector(state => state.auth);

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

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      await dispatch(loginWithGoogle());
      // Navigation will be handled automatically by AuthNavigator
    } catch (err) {
      console.error('Google login error:', err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailChange = text => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
      setWarning('That email address is invalid!');
    } else {
      setWarning('');
      dispatch(clearError());
    }
  };

  const handlePasswordChange = text => {
    setPassword(text);
    if (text.length >= 6) {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
      if (!passwordRegex.test(text)) {
        setWarning(
          'Password must be at least 6 characters and include a number',
        );
      } else {
        setWarning('');
        dispatch(clearError());
      }
    } else {
      setWarning('');
    }
  };

  const handleEmailLogin = async () => {
    if (!email) {
      setWarning('Please enter your email.');
      return;
    }

    if (!password || password.length < 6) {
      setWarning('Please enter a valid password (at least 6 characters).');
      return;
    }

    try {
      setIsEmailLoading(true);
      await dispatch(loginWithEmail({email, password}));
      // Navigation will be handled automatically by AuthNavigator
    } catch (err) {
      console.error('Email login error:', err);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsFacebookLoading(true);
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
      console.error('Facebook login error:', err);
    } finally {
      setIsFacebookLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigation.navigate('Signup');
  };

  const isAnyLoading = isEmailLoading || isGoogleLoading || isFacebookLoading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeIn,
              transform: [{translateY: slideUp}],
            },
          ]}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {warning && (
            <View style={styles.errorView}>
              <Image
                source={icons?.warning}
                style={styles.errorIocn}
                resizeMode="contain"
                tintColor={colors.error}
              />
              <Text style={[styles.subtitle, styles.errorText]}>{warning}</Text>
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
              <View style={[styles.inputWrapper]}>
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
                  accessibilityLabel="Password input"
                  accessibilityHint="Enter your password"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  accessibilityLabel={
                    showPassword ? 'Hide password' : 'Show password'
                  }>
                  <Image
                    style={styles.inputIcon}
                    source={showPassword ? icons.visible : icons.inVisible}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                isAnyLoading && !isEmailLoading && styles.buttonDisabled,
              ]}
              onPress={handleEmailLogin}
              disabled={isAnyLoading}
              accessibilityLabel="Sign in button">
              {isEmailLoading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
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
                onPress={handleGoogleLogin}
                disabled={isAnyLoading}
                accessibilityLabel="Continue with Google">
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
                    <Text style={styles.buttonText}>Continue with Google</Text>
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
                onPress={handleFacebookLogin}
                disabled={isAnyLoading}
                accessibilityLabel="Continue with Facebook">
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
              Don't have an account?{' '}
              <Text
                style={styles.linkText}
                onPress={navigateToSignup}
                accessibilityLabel="Navigate to sign up">
                Sign Up
              </Text>
            </Text>
          </View>
        </Animated.View>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: hp(2.98),
  },
  forgotPasswordText: {
    fontSize: fontSize(14),
    color: colors.gold,
    fontFamily: fonts.bold,
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
    marginVertical: hp(3.94),
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
    paddingBottom: hp(4.92),
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
  errorIocn: {
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

export default LoginScreen;
