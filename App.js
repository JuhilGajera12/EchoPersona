import React, {useCallback, memo, useEffect} from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {store, persistor} from './src/store';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  View,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import BootSplash from 'react-native-bootsplash';

import DailyPromptScreen from './src/screens/DailyPromptScreen';
import JournalScreen from './src/screens/JournalScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EvolutionScreen from './src/screens/EvolutionScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import {colors} from './src/constant/colors';
import {icons} from './src/constant/icons';
import {hp, wp} from './src/helpers/globalFunction';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const TAB_BAR_HEIGHT = hp(8);
const TAB_BAR_MARGIN = hp(2);
const TAB_BAR_PADDING = hp(1);

const AnimatedTabBarIcon = memo(({focused, icon}) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, {damping: 10});
    translateY.value = withSpring(focused ? -2 : 0, {damping: 10});
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}, {translateY: translateY.value}],
  }));

  return (
    <Animated.View style={[styles.tabIconContainer, animatedStyle]}>
      <Image
        source={icon}
        style={[
          styles.tabIcon,
          {tintColor: focused ? colors.gold : colors.sand},
        ]}
        resizeMode="contain"
      />
    </Animated.View>
  );
});

const TabButton = memo(({onPress, onLongPress, icon}) => (
  <Pressable
    onPress={onPress}
    onLongPress={onLongPress}
    style={({pressed}) => [styles.tabButton, {opacity: pressed ? 0.7 : 1}]}
    android_ripple={{color: colors.lightGray, borderless: true}}>
    {icon}
  </Pressable>
));

const MyTabBar = React.memo(({state, descriptors, navigation}) => {
  const renderTab = (route, index) => {
    const {options} = descriptors[route.key];
    const isFocused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    const onLongPress = () => {
      navigation.emit({
        type: 'tabLongPress',
        target: route.key,
      });
    };

    return (
      <TabButton
        key={route.key}
        onPress={onPress}
        onLongPress={onLongPress}
        icon={options.tabBarIcon({focused: isFocused})}
      />
    );
  };

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>{state.routes.map(renderTab)}</View>
    </View>
  );
});

const ScreenWrapper = memo(({children}) => (
  <SafeAreaView style={styles.screenWrapper}>
    <View style={styles.screenContent}>{children}</View>
  </SafeAreaView>
));

const TabNavigator = memo(() => {
  const renderScreen = useCallback(
    (name, component, icon) => (
      <Tab.Screen
        name={name}
        component={props => (
          <ScreenWrapper>{React.createElement(component, props)}</ScreenWrapper>
        )}
        options={{
          tabBarIcon: ({focused}) => (
            <AnimatedTabBarIcon focused={focused} icon={icon} />
          ),
        }}
      />
    ),
    [],
  );

  return (
    <Tab.Navigator
      tabBar={props => <MyTabBar {...props} />}
      screenOptions={{headerShown: false}}>
      {renderScreen('Daily Prompt', DailyPromptScreen, icons.pencil)}
      {renderScreen('Journal', JournalScreen, icons.journal)}
      {renderScreen('Profile', ProfileScreen, icons.user)}
      {renderScreen('Evolution', EvolutionScreen, icons.evolution)}
      {renderScreen('Premium', PremiumScreen, icons.premium)}
    </Tab.Navigator>
  );
});

const App = memo(() => {
  useEffect(() => {
    const init = async () => {
      // …do multiple sync or async tasks
    };

    init().finally(async () => {
      await BootSplash.hide({fade: true});
      console.log('BootSplash has been hidden successfully');
    });
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" translucent />
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen
                name="MainTabs"
                component={TabNavigator}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{presentation: 'modal', headerShown: false}}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </PersistGate>
    </Provider>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenWrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContent: {
    flex: 1,
    paddingBottom: TAB_BAR_HEIGHT + TAB_BAR_MARGIN + TAB_BAR_PADDING,
    backgroundColor: colors.white,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: TAB_BAR_MARGIN,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT + TAB_BAR_MARGIN,
    paddingBottom: Platform.OS === 'ios' ? TAB_BAR_MARGIN : 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    backgroundColor: colors.white,
    borderRadius: wp(4),
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: wp(5),
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconContainer: {
    width: wp(12),
    height: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    width: wp(6),
    height: wp(6),
  },
});

export default App;
