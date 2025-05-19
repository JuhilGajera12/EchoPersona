import React, {memo, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {StyleSheet, SafeAreaView, StatusBar} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import AuthNavigator from './src/components/AuthNavigator';
import {useColors} from './src/constant/colors';
import {navigationRef} from './src/helpers/globalFunction';
import {getSystemTheme} from './src/utils/themeUtils';
import {setDarkMode} from './src/store/slices/themeSlice';

const App = memo(() => {
  const dispatch = useDispatch();
  const colors = useColors();
  const styles = createStyles(colors);

  useEffect(() => {
    const init = async () => {
      const systemThemeIsDark = getSystemTheme();
      dispatch(setDarkMode(systemThemeIsDark));
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
