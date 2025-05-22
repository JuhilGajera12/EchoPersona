import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
  StatusBar,
  Dimensions,
  AppState,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import ReactNativeBiometrics from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';

import {AppDispatch} from '../store';
import {setAppLock} from '../store/slices/authSlice';
import {useColors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {icons} from '../constant/icons';
import {commonAction, fontSize, hp, wp} from '../helpers/globalFunction';
import {APP_LOCK_KEY} from '../helpers';
import {
  savePin,
  getPin,
  deletePin,
  isBiometricEnabled,
} from '../utils/secureStorage';

const {width} = Dimensions.get('window');
const PIN_LENGTH = 6;
const BUTTON_SIZE = width * 0.18;

const AppLockScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {params} = useRoute<any>();
  const isSetup = params?.isSetup || false;
  const dispatch = useDispatch<AppDispatch>();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [showPinScreen, setShowPinScreen] = useState(false);

  const shakeAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(1);
  const opacityAnimation = useSharedValue(1);
  const dotAnimations = Array.from({length: PIN_LENGTH}, () =>
    useSharedValue(0),
  );

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacityAnimation.value,
    transform: [
      {translateX: shakeAnimation.value},
      {scale: scaleAnimation.value},
    ],
  }));

  const dotAnimatedStyles = () =>
    dotAnimations.map(anim =>
      useAnimatedStyle(() => ({
        transform: [
          {
            scale: interpolate(anim.value, [0, 1], [1, 1.2], Extrapolate.CLAMP),
          },
        ],
      })),
    );

  const numpadAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scaleAnimation.value}],
  }));

  useEffect(() => {
    const loadPin = async () => {
      if (!isSetup) {
        try {
          const savedPin = await getPin();
          setStoredPin(savedPin);
        } catch (error) {
          console.error('Failed to load PIN:', error);
        }
      }
    };
    loadPin();
  }, [isSetup]);

  useEffect(() => {
    const handleBiometricAuth = async () => {
      if (!hasBiometrics || !biometricEnabled || isSetup) return;

      try {
        const rnBiometrics = new ReactNativeBiometrics();
        const {success} = await rnBiometrics.simplePrompt({
          promptMessage: 'Authenticate to unlock',
          cancelButtonText: 'Use PIN',
        });

        if (success) {
          runOnJS(commonAction)('MainTabs');
        } else {
          runOnJS(setShowPinScreen)(true);
        }
      } catch (error) {
        console.error('Biometric authentication failed:', error);
        runOnJS(setShowPinScreen)(true);
      }
    };

    if (!showPinScreen && hasBiometrics && biometricEnabled && !isSetup) {
      handleBiometricAuth();
    }
  }, [hasBiometrics, biometricEnabled, isSetup, showPinScreen]);

  useEffect(() => {
    let subscription: {remove: () => void} | null = null;

    const setupBiometrics = async () => {
      const rnBiometrics = new ReactNativeBiometrics();
      const {available} = await rnBiometrics.isSensorAvailable();
      setHasBiometrics(available);

      if (available) {
        const enabled = await isBiometricEnabled();
        setBiometricEnabled(enabled);
      }

      if (!isSetup && available && (await isBiometricEnabled())) {
        setShowPinScreen(false);
      } else if (!isSetup) {
        setShowPinScreen(true);
      }
    };

    const setupAppStateListener = () => {
      subscription = AppState.addEventListener('change', nextAppState => {
        if (nextAppState === 'active' && !isSetup) {
          if (hasBiometrics && biometricEnabled) {
            setShowPinScreen(false);
          } else {
            setShowPinScreen(true);
          }
        }
      });
    };

    setupBiometrics();
    setupAppStateListener();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isSetup, biometricEnabled, hasBiometrics]);

  const handlePinInput = useCallback(
    (digit: string) => {
      if (error) {
        setError('');
      }
      const current = isSetup ? (isConfirming ? confirmPin : pin) : pin;
      if (current.length < PIN_LENGTH) {
        const newPin = current + digit;
        if (isSetup) {
          isConfirming ? setConfirmPin(newPin) : setPin(newPin);
          if (newPin.length === PIN_LENGTH && !isConfirming) {
            handleContinue();
          }
        } else {
          setPin(newPin);
          if (newPin.length === PIN_LENGTH) {
            handleContinue();
          }
        }
        animateDot(current.length);
      }
    },
    [confirmPin, error, isConfirming, isSetup, pin],
  );

  const handleDelete = useCallback(() => {
    if (isSetup) {
      isConfirming
        ? setConfirmPin(prev => prev.slice(0, -1))
        : setPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  }, [isConfirming, isSetup]);

  const handleContinue = useCallback(() => {
    if (isSetup) {
      if (!isConfirming && pin.length === PIN_LENGTH) {
        setIsConfirming(true);
        setError('');
      } else if (isConfirming && confirmPin.length === PIN_LENGTH) {
        verifyPinSetup();
      }
    } else {
      if (pin.length === PIN_LENGTH) {
        verifyPin(pin);
      }
    }
  }, [confirmPin.length, isConfirming, isSetup, pin]);

  const verifyPinSetup = async () => {
    if (pin === confirmPin && pin.length === PIN_LENGTH) {
      try {
        const saved = await savePin(pin);
        if (saved) {
          if (hasBiometrics) {
            const enableBiometric = await new Promise<boolean>(resolve => {
              Alert.alert(
                'Enable Biometric Authentication',
                'Would you like to enable biometric authentication for faster access?',
                [
                  {
                    text: 'No',
                    onPress: () => resolve(false),
                    style: 'cancel',
                  },
                  {
                    text: 'Yes',
                    onPress: () => resolve(true),
                  },
                ],
              );
            });

            if (enableBiometric) {
              await setBiometricEnabled(true);
              setBiometricEnabled(true);
            }
          }
          opacityAnimation.value = withTiming(0, {duration: 300}, () => {
            runOnJS(commonAction)('MainTabs');
          });
        } else {
          throw new Error('Failed to save PIN');
        }
      } catch (error) {
        setError('Failed to save PIN. Please try again.');
        setConfirmPin('');
        shakeError();
      }
    } else {
      setError('PINs do not match');
      setConfirmPin('');
      shakeError();
    }
  };

  const verifyPin = async (enteredPin: string) => {
    if (enteredPin === storedPin) {
      opacityAnimation.value = withTiming(0, {duration: 300}, () => {
        runOnJS(commonAction)('MainTabs');
      });
    } else {
      setError('Incorrect PIN');
      setPin('');
      shakeError();
    }
  };

  const handleCancel = async () => {
    try {
      dispatch(setAppLock(false));
      await AsyncStorage.setItem(APP_LOCK_KEY, 'false');
      await deletePin();
      await setBiometricEnabled(false);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to disable app lock. Please try again.');
    }
  };

  const animateDot = useCallback(
    (index: number) => {
      dotAnimations[index].value = withSequence(
        withTiming(1, {duration: 200, easing: Easing.bezier(0.4, 0, 0.2, 1)}),
        withTiming(0, {duration: 200, easing: Easing.bezier(0.4, 0, 0.2, 1)}),
      );
    },
    [dotAnimations],
  );

  const shakeError = () => {
    shakeAnimation.value = withSequence(
      withTiming(-10, {duration: 100}),
      withTiming(10, {duration: 100}),
      withTiming(-10, {duration: 100}),
      withTiming(10, {duration: 100}),
      withTiming(0, {duration: 100}),
    );
    scaleAnimation.value = withSequence(
      withTiming(0.95, {duration: 100}),
      withTiming(1, {duration: 100}),
    );
  };

  const handleBiometricPress = useCallback(() => {
    setShowPinScreen(false);
  }, []);

  const renderPinDots = useCallback(() => {
    const current = isSetup ? (isConfirming ? confirmPin : pin) : pin;
    return (
      <View style={styles.pinContainer}>
        {dotAnimations.map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.pinDot,
              {
                backgroundColor:
                  i < current.length ? colors.gold : colors.lightGray,
              },
              dotAnimatedStyles[i],
            ]}
          />
        ))}
      </View>
    );
  }, [
    isSetup,
    isConfirming,
    confirmPin,
    pin,
    styles.pinContainer,
    styles.pinDot,
    dotAnimations,
    colors.gold,
    colors.lightGray,
    dotAnimatedStyles,
  ]);

  const renderActionButton = useCallback(() => {
    const currentPin = isSetup ? (isConfirming ? confirmPin : pin) : pin;
    const isDisabled = currentPin.length !== PIN_LENGTH;
    const buttonText = isSetup
      ? isConfirming
        ? 'Confirm'
        : 'Continue'
      : 'Continue';

    return (
      <TouchableOpacity
        style={[styles.actionButton, isDisabled && styles.actionButtonDisabled]}
        onPress={handleContinue}
        disabled={isDisabled}
        activeOpacity={0.7}>
        <Text
          style={[
            styles.actionButtonText,
            isDisabled && styles.actionButtonTextDisabled,
          ]}>
          {buttonText}
        </Text>
      </TouchableOpacity>
    );
  }, [isSetup, isConfirming, confirmPin, pin, styles, handleContinue]);

  const renderNumpad = useCallback(() => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'delete'];
    return (
      <View style={styles.numpadContainer}>
        {numbers.map((num, i) => (
          <Animated.View key={i} style={numpadAnimatedStyle}>
            <TouchableOpacity
              style={[styles.numpadButton, num === '' && styles.emptyButton]}
              onPress={() => {
                if (num === 'delete') {
                  handleDelete();
                } else if (num !== '') {
                  handlePinInput(num.toString());
                }
              }}
              disabled={num === ''}
              activeOpacity={0.7}>
              {num === 'delete' ? (
                <Image
                  source={icons.delete}
                  style={styles.deleteIcon}
                  tintColor={colors.black}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.numpadText}>{num}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    );
  }, [styles, colors.black, numpadAnimatedStyle, handleDelete, handlePinInput]);

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      {isSetup ? (
        <>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
              activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              {isConfirming ? 'Confirm PIN' : 'Create PIN'}
            </Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>
              {isConfirming ? 'Confirm your PIN' : 'Create a 6-digit PIN'}
            </Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {renderPinDots()}
            {renderActionButton()}
            {renderNumpad()}
          </View>
        </>
      ) : showPinScreen ? (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Enter PIN</Text>
            {hasBiometrics && biometricEnabled && (
              <TouchableOpacity
                onPress={handleBiometricPress}
                style={styles.biometricButton}
                activeOpacity={0.7}>
                <Image
                  source={icons.lock}
                  style={styles.biometricIcon}
                  tintColor={colors.black}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>Enter your PIN to continue</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {renderPinDots()}
            {renderActionButton()}
            {renderNumpad()}
          </View>
        </>
      ) : (
        <View style={styles.biometricContainer}>
          <Image
            source={icons.lock}
            style={styles.biometricLargeIcon}
            tintColor={colors.gold}
            resizeMode="contain"
          />
          <Text style={styles.biometricTitle}>Unlock App</Text>
          <Text style={styles.biometricSubtitle}>
            Use biometric authentication to continue
          </Text>
          <TouchableOpacity
            onPress={() => setShowPinScreen(true)}
            style={styles.usePinButton}
            activeOpacity={0.7}>
            <Text style={styles.usePinText}>Use PIN Instead</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.white,
      marginTop: Platform.OS === 'ios' ? hp(6) : StatusBar.currentHeight,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: wp(6),
      height: hp(6),
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGray,
    },
    title: {
      fontSize: fontSize(20),
      fontFamily: fonts.bold,
      color: colors.black,
    },
    subtitle: {
      fontSize: fontSize(16),
      fontFamily: fonts.regular,
      color: colors.black,
      textAlign: 'center',
      marginBottom: hp(4),
    },
    cancelButton: {padding: wp(2)},
    cancelText: {
      fontSize: fontSize(16),
      fontFamily: fonts.regular,
      color: colors.black,
    },
    biometricButton: {padding: wp(2)},
    biometricIcon: {width: wp(6), height: wp(6)},
    content: {flex: 1, alignItems: 'center', paddingTop: hp(8)},
    pinContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: hp(8),
    },
    pinDot: {
      width: wp(4),
      height: wp(4),
      borderRadius: wp(2),
      marginHorizontal: wp(3),
    },
    numpadContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      width: width * 0.85,
      paddingHorizontal: wp(2),
    },
    numpadButton: {
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: BUTTON_SIZE / 2,
      backgroundColor: colors.lightGray,
      alignItems: 'center',
      justifyContent: 'center',
      margin: wp(2),
      shadowColor: colors.black,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    emptyButton: {
      backgroundColor: 'transparent',
      shadowOpacity: 0,
      elevation: 0,
    },
    numpadText: {
      fontFamily: fonts.regular,
      fontSize: fontSize(24),
      color: colors.black,
    },
    deleteIcon: {width: wp(6), height: wp(6)},
    errorText: {
      color: colors.error,
      fontFamily: fonts.regular,
      fontSize: fontSize(14),
      marginBottom: hp(2),
    },
    actionButton: {
      backgroundColor: colors.gold,
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(8),
      borderRadius: wp(4),
      marginBottom: hp(4),
      shadowColor: colors.black,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    actionButtonDisabled: {
      backgroundColor: colors.lightGray,
      shadowOpacity: 0,
      elevation: 0,
    },
    actionButtonText: {
      color: colors.white,
      fontSize: fontSize(16),
      fontFamily: fonts.bold,
      textAlign: 'center',
    },
    actionButtonTextDisabled: {color: colors.darkGray},
    biometricContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: wp(6),
    },
    biometricLargeIcon: {
      width: wp(20),
      height: wp(20),
      marginBottom: hp(4),
    },
    biometricTitle: {
      fontSize: fontSize(24),
      fontFamily: fonts.bold,
      color: colors.black,
      marginBottom: hp(2),
    },
    biometricSubtitle: {
      fontSize: fontSize(16),
      fontFamily: fonts.regular,
      color: colors.darkGray,
      textAlign: 'center',
      marginBottom: hp(4),
    },
    usePinButton: {
      padding: wp(4),
    },
    usePinText: {
      fontSize: fontSize(16),
      fontFamily: fonts.regular,
      color: colors.gold,
    },
  });

export default AppLockScreen;
