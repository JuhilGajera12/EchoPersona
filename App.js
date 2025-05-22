import React, {memo, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {StyleSheet, SafeAreaView, StatusBar} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import AuthNavigator from './src/components/AuthNavigator';
import {useColors} from './src/constant/colors';
import {commonAction, navigationRef} from './src/helpers/globalFunction';
import {getSystemTheme} from './src/utils/themeUtils';
import {setDarkMode} from './src/store/slices/themeSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {THEME_KEY} from './src/helpers';
import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';

const App = memo(() => {
  const dispatch = useDispatch();
  const colors = useColors();
  const styles = createStyles(colors);

  const rnBiometrics = new ReactNativeBiometrics();

  useEffect(() => {
    const init = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (storedTheme === 'dark') {
          dispatch(setDarkMode(true));
        } else if (storedTheme === 'light') {
          dispatch(setDarkMode(false));
        } else {
          const systemThemeIsDark = getSystemTheme();
          dispatch(setDarkMode(systemThemeIsDark));
        }
        rnBiometrics.isSensorAvailable().then(async resultObject => {
          const {available, biometryType} = resultObject;
          if (available && biometryType === BiometryTypes.Biometrics) {
            const {success} = await rnBiometrics.simplePrompt({
              promptMessage: 'Unlock App',
            });
            if (success) {
              commonAction('MainTabs');
            }
          } else {
            console.log('Biometrics not supported');
          }
        });
      } catch (e) {
        console.error('Failed to load theme:', e);
      }
    };

    init().finally(async () => {
      await BootSplash.hide({fade: true});
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent />
      <NavigationContainer ref={navigationRef}>
        <AuthNavigator />
      </NavigationContainer>
    </SafeAreaView>
  );
});

const createStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background || colors.white,
    },
  });

export default App;
