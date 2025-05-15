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
import {commonAction, fontSize, hp, wp} from '../helpers/globalFunction';
import {fonts} from '../constant/fonts';
import {icons} from '../constant/icons';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [warning, setWarning] = useState('');

  const navigation = useNavigation();

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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      GoogleSignin.configure();
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      const signInResult = await GoogleSignin.signIn();

      const idToken = signInResult?.idToken;
      if (!idToken) throw new Error('No ID token found');

      const googleCredential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(getAuth(), googleCredential);

      commonAction('MainTabs');
    } catch (err) {
      console.error('Google login error:', err);
      setWarning('Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailChange = text => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
      setWarning('That email address is invalid!');
    } else {
      setWarning('');
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
      }
    } else {
      setWarning('');
    }
  };

  const handleEmailLogin = async () => {
    setEmailLoading(true);
    try {
      await createUserWithEmailAndPassword(getAuth(), email, password);
      commonAction('MainTabs');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        try {
          await signInWithEmailAndPassword(getAuth(), email, password);
          commonAction('MainTabs');
        } catch (signInError) {
          if (signInError.code === 'auth/wrong-password') {
            setWarning('Wrong password. Please try again.');
          } else if (signInError.code === 'auth/user-not-found') {
            setWarning('No account found with this email.');
          } else {
            setWarning('Sign-in failed. Please check your credentials.');
          }
        }
      } else if (error.code === 'auth/invalid-email') {
        setWarning('That email address is invalid!');
      } else if (error.code === 'auth/weak-password') {
        setWarning('Password should be at least 6 characters.');
      } else {
        setWarning('Something went wrong. Please try again.');
      }
    } finally {
      setEmailLoading(false);
    }
  };

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
              style={[styles.loginButton]}
              onPress={handleEmailLogin}
              disabled={emailLoading || googleLoading}
              accessibilityLabel="Sign in button">
              {emailLoading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleLogin}
              disabled={emailLoading || googleLoading}
              accessibilityLabel="Continue with Google">
              {googleLoading ? (
                <ActivityIndicator color={colors.black} size="small" />
              ) : (
                <>
                  <Image
                    style={{height: wp(4.26), width: wp(4.26)}}
                    resizeMode="contain"
                  />
                  <Text style={styles.socialButtonText}>
                    Continue with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text
                style={styles.linkText}
                onPress={() => navigation.navigate('Signup')}
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
    marginTop: hp(8.92),
    marginBottom: hp(4.92),
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
    padding: wp(5.33),
    paddingLeft: 0,
    fontSize: fontSize(14),
    color: colors.black,
    fontFamily: fonts.regular,
  },
  eyeIcon: {
    padding: wp(5.33),
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
  loginButton: {
    backgroundColor: colors.black,
    borderRadius: wp(3),
    padding: wp(4.26),
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
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
  socialButton: {
    flexDirection: 'row',
    backgroundColor: colors.gold,
    borderRadius: wp(3),
    paddingVertical: wp(4.26),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: wp(3),
    elevation: 5,
  },
  socialButtonText: {
    marginLeft: 12,
    color: colors.white,
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
  },
  footer: {
    paddingBottom: hp(4.92),
    alignItems: 'center',
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
});

export default LoginScreen;
