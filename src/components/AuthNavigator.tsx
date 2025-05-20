import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../store';
import {setUser} from '../store/slices/authSlice';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import {useColors} from '../constant/colors';
import {icons} from '../constant/icons';
import {hp, wp} from '../helpers/globalFunction';
import auth from '@react-native-firebase/auth';

const TabStack = createNativeStackNavigator();

const DailyPromptScreen = require('../screens/DailyPromptScreen').default;
const JournalScreen = require('../screens/JournalScreen').default;
const ProfileScreen = require('../screens/ProfileScreen').default;
const EvolutionScreen = require('../screens/EvolutionScreen').default;
const PremiumScreen = require('../screens/PremiumScreen').default;

const {createBottomTabNavigator} = require('@react-navigation/bottom-tabs');
const Tab = createBottomTabNavigator();

type AnimatedTabBarIconProps = {
  focused: boolean;
  icon: number;
};

const AnimatedTabBarIcon: React.FC<AnimatedTabBarIconProps> = ({
  focused,
  icon,
}) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const colors = useColors();
  const styles = createStyles(colors);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, {damping: 10});
    translateY.value = withSpring(focused ? -2 : 0, {damping: 10});
  }, [focused, scale, translateY]);

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
};

type TabButtonProps = {
  onPress: () => void;
  onLongPress: () => void;
  icon: React.ReactNode;
};

const TabButton: React.FC<TabButtonProps> = ({onPress, onLongPress, icon}) => {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({pressed}) => [styles.tabButton, {opacity: pressed ? 0.7 : 1}]}
      android_ripple={{color: colors.lightGray, borderless: true}}>
      {icon}
    </Pressable>
  );
};

type MyTabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

const MyTabBar: React.FC<MyTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
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
        })}
      </View>
    </View>
  );
};

const ScreenWrapper: React.FC<{children: React.ReactNode}> = ({children}) => {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <SafeAreaView style={styles.screenWrapper}>
      <View style={styles.screenContent}>{children}</View>
    </SafeAreaView>
  );
};

const renderScreen = (
  name: string,
  Component: React.ComponentType<any>,
  icon: number,
) => (
  <Tab.Screen
    key={name}
    name={name}
    options={{
      tabBarIcon: ({focused}: {focused: boolean}) => (
        <AnimatedTabBarIcon focused={focused} icon={icon} />
      ),
    }}>
    {(props: any) => (
      <ScreenWrapper>
        <Component {...props} />
      </ScreenWrapper>
    )}
  </Tab.Screen>
);

const MainTabs: React.FC = () => (
  <Tab.Navigator
    tabBar={(props: any) => <MyTabBar {...props} />}
    screenOptions={{headerShown: false}}>
    {renderScreen('Daily Prompt', DailyPromptScreen, icons.pencil)}
    {renderScreen('Journal', JournalScreen, icons.journal)}
    {renderScreen('Profile', ProfileScreen, icons.user)}
    {renderScreen('Evolution', EvolutionScreen, icons.evolution)}
    {renderScreen('Premium', PremiumScreen, icons.premium)}
  </Tab.Navigator>
);

const AuthNavigator: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const dispatch = useDispatch();
  const {isAuthenticated} = useSelector((state: RootState) => state.auth);
  const {hasCompletedOnboarding} = useSelector(
    (state: RootState) => state.onboarding,
  );
  const colors = useColors();
  const styles = createStyles(colors);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user => {
      if (user) {
        const serializedUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
          emailVerified: user.emailVerified,
          providerId: user.providerId,
        };
        dispatch(setUser(serializedUser));
      } else {
        dispatch(setUser(null));
      }

      if (initializing) {
        setInitializing(false);
      }
    });

    return subscriber;
  }, [dispatch, initializing]);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <TabStack.Navigator
      initialRouteName={
        isAuthenticated
          ? hasCompletedOnboarding
            ? 'MainTabs'
            : 'Onboarding'
          : 'Login'
      }
      screenOptions={{headerShown: false}}>
      {isAuthenticated ? (
        <>
          {!hasCompletedOnboarding && (
            <TabStack.Screen name="Onboarding" component={OnboardingScreen} />
          )}
          <TabStack.Screen name="MainTabs" component={MainTabs} />
          <TabStack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{presentation: 'modal'}}
          />
        </>
      ) : (
        <>
          <TabStack.Screen name="Login" component={LoginScreen} />
          <TabStack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </TabStack.Navigator>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.white,
    },
    screenWrapper: {
      flex: 1,
      backgroundColor: colors.white,
    },
    screenContent: {
      flex: 1,
      paddingBottom: hp(11),
      backgroundColor: colors.white,
    },
    tabBarContainer: {
      position: 'absolute',
      bottom: hp(2),
      left: 0,
      right: 0,
      height: hp(10),
      paddingBottom: Platform.OS === 'ios' ? hp(2) : 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabBar: {
      flexDirection: 'row',
      height: hp(8),
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

export default AuthNavigator;
