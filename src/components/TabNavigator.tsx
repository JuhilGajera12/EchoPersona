import React, {memo, useCallback} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Pressable,
  Image,
  Platform,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';

import DailyPromptScreen from '../screens/DailyPromptScreen';
import JournalScreen from '../screens/JournalScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EvolutionScreen from '../screens/EvolutionScreen';
import PremiumScreen from '../screens/PremiumScreen';
import {useColors} from '../constant/colors';
import {icons} from '../constant/icons';
import {hp, wp} from '../helpers/globalFunction';

const Tab = createBottomTabNavigator();
const TAB_BAR_HEIGHT = hp(8);
const TAB_BAR_MARGIN = hp(2);
const TAB_BAR_PADDING = hp(1);

const AnimatedTabBarIcon = memo(({focused, icon}) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const colors = useColors();
  const styles = createStyles(colors);

  React.useEffect(() => {
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
});

const TabButton = memo(({onPress, onLongPress, icon}) => {
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
});

const MyTabBar = React.memo(({state, descriptors, navigation}) => {
  const colors = useColors();
  const styles = createStyles(colors);
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

const ScreenWrapper = memo(({children}) => {
  const colors = useColors();
  const styles = createStyles(colors);
  return (
    <SafeAreaView style={styles.screenWrapper}>
      <View style={styles.screenContent}>{children}</View>
    </SafeAreaView>
  );
});

const TabNavigator = () => {
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
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    screenWrapper: {
      flex: 1,
      backgroundColor: colors.white,
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

export default TabNavigator;
