import React, {memo, useEffect} from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor} from './src/store';
import {NavigationContainer} from '@react-navigation/native';
import {StyleSheet, SafeAreaView, StatusBar} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import AuthNavigator from './src/components/AuthNavigator';
import {colors} from './src/constant/colors';
import {navigationRef} from './src/helpers/globalFunction';

const App = memo(() => {
  useEffect(() => {
    const init = async () => {
      // …do multiple sync or async tasks
    };

    init().finally(async () => {
      await BootSplash.hide({fade: true});
    });
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" translucent />
          <NavigationContainer ref={navigationRef}>
            <AuthNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </PersistGate>
    </Provider>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || colors.white,
  },
});

export default App;
