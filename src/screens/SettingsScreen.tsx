import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Image,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, AppDispatch} from '../store';
import {clearProfile} from '../store/slices/profileSlice';
import {clearEntries} from '../store/slices/journalSlice';
import {clearSubscription} from '../store/slices/premiumSlice';
import {clearPromptHistory} from '../store/slices/promptSlice';
import {logout, deleteAccount, setAppLock} from '../store/slices/authSlice';
import {useColors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {icons} from '../constant/icons';
import {fontSize, hp, navigate, wp} from '../helpers/globalFunction';
import ConfirmationModal from '../components/ConfirmationModal';
import {setDarkMode} from '../store/slices/themeSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {APP_LOCK_KEY, THEME_KEY} from '../helpers';
import {isBiometricEnabled} from '../utils/secureStorage';
import ReactNativeBiometrics from 'react-native-biometrics';

const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

const SettingsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const isAppLock = useSelector((state: RootState) => state.auth.isAppLock);
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => Promise<void>;
    isDanger?: boolean;
  }>({
    visible: false,
    title: '',
    message: '',
    confirmText: '',
    onConfirm: async () => {},
  });

  const colors = useColors();
  const styles = createStyles(colors);
  const isPremium = useSelector((state: RootState) => state.premium.isPremium);
  const auth = useSelector((state: RootState) => state.auth);
  const isLoading = auth.isLoading;
  const isFacebookUser = auth.user?.providerId === 'facebook.com';
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    const checkBiometrics = async () => {
      const rnBiometrics = new ReactNativeBiometrics();
      const {available} = await rnBiometrics.isSensorAvailable();
      setHasBiometrics(available);

      if (available) {
        const isEnabled = await isBiometricEnabled();
        setBiometricEnabled(isEnabled);
      }
    };

    checkBiometrics();
  }, []);

  const handleLogout = () => {
    setModalConfig({
      visible: true,
      title: 'Logout',
      message: 'Are you sure you want to logout from your account?',
      confirmText: 'Logout',
      onConfirm: async () => {
        try {
          await dispatch(logout()).unwrap();
          dispatch(clearProfile());
          dispatch(clearEntries());
          dispatch(clearSubscription());
          dispatch(clearPromptHistory());
        } catch (error: any) {
          throw new Error(
            error.message || 'Failed to logout. Please try again.',
          );
        }
      },
    });
  };

  const handleDeleteAccount = () => {
    if (isFacebookUser) {
      setModalConfig({
        visible: true,
        title: 'Not Available',
        message:
          'Account deletion is not available for Facebook accounts. Please contact support if you need assistance.',
        confirmText: 'OK',
        onConfirm: async () => {
          setModalConfig(prev => ({...prev, visible: false}));
        },
      });
      return;
    }

    setModalConfig({
      visible: true,
      title: 'Delete Account',
      message:
        'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
      confirmText: 'Delete',
      isDanger: true,
      onConfirm: async () => {
        try {
          await dispatch(deleteAccount()).unwrap();
          dispatch(clearProfile());
          dispatch(clearEntries());
          dispatch(clearSubscription());
          dispatch(clearPromptHistory());
        } catch (error: any) {
          throw new Error(
            error.message || 'Failed to delete account. Please try again.',
          );
        }
      },
    });
  };

  const handleExportData = () => {};

  const handleToggleAppLock = async (isLock: boolean) => {
    try {
      if (isLock) {
        dispatch(setAppLock(true));
        await AsyncStorage.setItem(APP_LOCK_KEY, 'true');
        navigate('AppLock', {isSetup: true});
      } else {
        const confirmDisable = await new Promise<boolean>(resolve => {
          Alert.alert(
            'Disable App Lock',
            'Are you sure you want to disable app lock? This will remove your PIN and biometric settings.',
            [
              {
                text: 'Cancel',
                onPress: () => resolve(false),
                style: 'cancel',
              },
              {
                text: 'Disable',
                onPress: () => resolve(true),
                style: 'destructive',
              },
            ],
          );
        });

        if (confirmDisable) {
          dispatch(setAppLock(false));
          await AsyncStorage.setItem(APP_LOCK_KEY, 'false');
          await setBiometricEnabled(false);
          setBiometricEnabled(false);
        }
      }
    } catch (error) {
      console.error('Failed to toggle app lock:', error);
      Alert.alert('Error', 'Failed to toggle app lock. Please try again.');
      dispatch(setAppLock(!isLock));
    }
  };

  const handleToggleBiometric = async (enabled: boolean) => {
    try {
      if (enabled) {
        const rnBiometrics = new ReactNativeBiometrics();
        const {success} = await rnBiometrics.simplePrompt({
          promptMessage: 'Authenticate to enable biometric login',
          cancelButtonText: 'Cancel',
        });

        if (success) {
          await setBiometricEnabled(true);
          setBiometricEnabled(true);
        }
      } else {
        const confirmDisable = await new Promise<boolean>(resolve => {
          Alert.alert(
            'Disable Biometric Login',
            'Are you sure you want to disable biometric login? You will need to use your PIN to unlock the app.',
            [
              {
                text: 'Cancel',
                onPress: () => resolve(false),
                style: 'cancel',
              },
              {
                text: 'Disable',
                onPress: () => resolve(true),
              },
            ],
          );
        });

        if (confirmDisable) {
          await setBiometricEnabled(false);
          setBiometricEnabled(false);
        }
      }
    } catch (error) {
      console.error('Failed to toggle biometric:', error);
      Alert.alert(
        'Error',
        'Failed to toggle biometric login. Please try again.',
      );
    }
  };

  const renderSettingItem = (
    icon: any,
    title: string,
    rightElement?: React.ReactNode,
    onPress?: () => void,
    isDanger?: boolean,
    disabled?: boolean,
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, onPress && styles.settingItemPressable]}
      onPress={onPress}
      disabled={!onPress || isLoading || disabled}>
      <View style={styles.settingInfo}>
        <View
          style={[
            styles.iconContainer,
            isDanger && styles.dangerIconContainer,
          ]}>
          <Image
            source={icon}
            style={[styles.settingIcon, isDanger && styles.dangerIcon]}
            tintColor={isDanger ? colors.black : colors.gold}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.settingText, isDanger && styles.dangerText]}>
          {title}
        </Text>
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  const onToggleTheme = async (isDark: boolean) => {
    dispatch(setDarkMode(isDark));
    await AsyncStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View
        style={[
          styles.header,
          {
            paddingTop:
              Platform.OS === 'ios' ? hp(6) : STATUS_BAR_HEIGHT + hp(2),
          },
        ]}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your experience</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          {renderSettingItem(
            icons.setting,
            'Dark Mode',
            <Switch
              value={isDarkMode}
              onValueChange={onToggleTheme}
              trackColor={{false: colors.lightGray, true: colors.gold}}
              thumbColor={colors.white}
            />,
          )}
          {renderSettingItem(
            icons.lock,
            'App Lock',
            <Switch
              value={isAppLock}
              onValueChange={handleToggleAppLock}
              trackColor={{false: colors.lightGray, true: colors.gold}}
              thumbColor={colors.white}
              disabled={isLoading}
            />,
          )}
          {isAppLock && hasBiometrics && (
            <>
              {renderSettingItem(
                icons.lock,
                'Biometric Login',
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleToggleBiometric}
                  trackColor={{false: colors.lightGray, true: colors.gold}}
                  thumbColor={colors.white}
                  disabled={isLoading}
                />,
              )}
              <Text style={styles.settingDescription}>
                Use biometric authentication for faster access to the app
              </Text>
            </>
          )}
          <Text style={styles.settingDescription}>
            Secure your app with PIN and optional biometric authentication
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {renderSettingItem(
            icons.email,
            'Export Data',
            null,
            handleExportData,
          )}
          {renderSettingItem(
            icons.delete,
            'Delete Account',
            null,
            handleDeleteAccount,
            true,
            isFacebookUser,
          )}
          {isFacebookUser && (
            <Text style={styles.disabledText}>
              Account deletion is not available for Facebook accounts
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          {renderSettingItem(
            icons.premium,
            'Premium Status',
            <View style={[styles.statusBadge, isPremium && styles.activeBadge]}>
              <Text
                style={[
                  styles.statusText,
                  isPremium && styles.activeStatusText,
                ]}>
                {isPremium ? 'Active' : 'Inactive'}
              </Text>
            </View>,
          )}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoading}
          activeOpacity={0.8}>
          <Image
            source={icons.setting}
            style={styles.logoutIcon}
            tintColor={colors.black}
            resizeMode="contain"
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>

      <ConfirmationModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.isDanger ? 'Cancel' : 'Close'}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(prev => ({...prev, visible: false}))}
        isLoading={isLoading}
        isDanger={modalConfig.isDanger}
      />
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.white,
    },
    header: {
      paddingBottom: hp(3),
      paddingHorizontal: wp(6),
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGray,
    },
    headerTitle: {
      fontSize: fontSize(32),
      fontFamily: fonts.bold,
      color: colors.black,
      marginBottom: hp(1),
    },
    headerSubtitle: {
      fontSize: fontSize(16),
      fontFamily: fonts.regular,
      color: colors.sand,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      paddingHorizontal: wp(6),
      paddingVertical: hp(3),
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGray,
    },
    sectionTitle: {
      fontSize: fontSize(18),
      fontFamily: fonts.bold,
      color: colors.black,
      marginBottom: hp(2),
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: hp(1.5),
      marginVertical: hp(0.5),
    },
    settingItemPressable: {
      opacity: 1,
    },
    settingInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: wp(10),
      height: wp(10),
      borderRadius: wp(5),
      backgroundColor: colors.lightGray,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(4),
    },
    dangerIconContainer: {
      backgroundColor: colors.lightGray,
    },
    settingIcon: {
      width: wp(5),
      height: wp(5),
    },
    dangerIcon: {
      tintColor: colors.black,
    },
    settingText: {
      fontSize: fontSize(16),
      fontFamily: fonts.regular,
      color: colors.black,
      flex: 1,
    },
    dangerText: {
      color: colors.black,
      fontFamily: fonts.bold,
    },
    statusBadge: {
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.5),
      borderRadius: wp(4),
      backgroundColor: colors.lightGray,
    },
    activeBadge: {
      backgroundColor: colors.gold,
    },
    statusText: {
      fontSize: fontSize(14),
      fontFamily: fonts.regular,
      color: colors.sand,
    },
    activeStatusText: {
      color: colors.white,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      margin: wp(6),
      padding: wp(4),
      backgroundColor: colors.lightGray,
      borderRadius: wp(3),
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    logoutIcon: {
      width: wp(5),
      height: wp(5),
      marginRight: wp(2),
    },
    logoutText: {
      fontSize: fontSize(16),
      fontFamily: fonts.bold,
      color: colors.black,
    },
    version: {
      textAlign: 'center',
      fontSize: fontSize(14),
      fontFamily: fonts.regular,
      color: colors.sand,
      marginBottom: hp(8),
    },
    disabledText: {
      fontSize: fontSize(14),
      fontFamily: fonts.regular,
      color: colors.error,
      marginTop: hp(1),
      marginLeft: wp(14),
    },
    settingDescription: {
      fontFamily: fonts.regular,
      fontSize: fontSize(12),
      color: colors.sand,
      marginTop: hp(-1),
      marginBottom: hp(2),
      marginLeft: wp(12),
    },
  });

export default SettingsScreen;
