import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {useColors} from '../constant/colors';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {fonts} from '../constant/fonts';
import {icons} from '../constant/icons';
import {
  SceneMap,
  TabView,
  TabBar,
  Route,
  TabBarItemProps as TabViewTabBarItemProps,
} from 'react-native-tab-view';
import PromptHistoryScreen from './PromptHistoryScreen';
import CalendarScreen from './CalendarScreen';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

const routes = [
  {key: 'history', title: 'History'},
  {key: 'calendar', title: 'Calendar View'},
];

const renderScene = SceneMap({
  history: PromptHistoryScreen,
  calendar: CalendarScreen,
});

const CustomTabBarItem = (props: TabViewTabBarItemProps<Route>) => {
  const {route, focused, onPress} = props;
  const colors = useColors();
  const styles = createStyles(colors);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        {
          scale: withSpring(focused ? 1.05 : 1, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
    };
  });

  const textColor = useAnimatedStyle(() => {
    'worklet';
    return {
      color: focused ? colors.gold : colors.sand,
      fontFamily: focused ? fonts.bold : fonts.regular,
    };
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.tabItemContainer}>
      <Animated.View style={[styles.tabItem, animatedStyle]}>
        <Animated.Text style={[styles.tabItemText, textColor]}>
          {route.title}
        </Animated.Text>
        {focused && <View style={styles.activeIndicator} />}
      </Animated.View>
    </TouchableOpacity>
  );
};

const JournalScreen = () => {
  const colors = useColors();
  const styles = createStyles(colors);
  const [index, setIndex] = useState(0);

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const headerScale = useSharedValue(1);

  useEffect(() => {
    fadeAnim.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    slideAnim.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
      mass: 1,
    });
  }, [fadeAnim, slideAnim]);

  const headerStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: fadeAnim.value,
      transform: [{translateY: slideAnim.value}, {scale: headerScale.value}],
    };
  }, []);

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      style={styles.tabBar}
      indicatorStyle={styles.tabIndicator}
      activeColor={colors.gold}
      inactiveColor={colors.sand}
      pressColor={colors.lightGray}
      pressOpacity={0.7}
      renderTabBarItem={props => <CustomTabBarItem {...props} />}
    />
  );

  const handleIndexChange = (value: number) => {
    setIndex(value);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <Animated.View style={[styles.header, headerStyle]}>
        <View style={styles.headerContent}>
          <Image
            source={icons.journal}
            style={styles.headerIcon}
            tintColor={colors.gold}
            resizeMode="contain"
          />
          <Text style={styles.title}>Journal</Text>
          <Text style={styles.subtitle}>Your personal reflections</Text>
        </View>
      </Animated.View>

      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={handleIndexChange}
        initialLayout={{width: Dimensions.get('window').width}}
        renderTabBar={renderTabBar}
        style={styles.tabView}
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
      backgroundColor: colors.white,
      paddingTop: Platform.OS === 'ios' ? hp(6) : STATUS_BAR_HEIGHT + hp(2),
      paddingBottom: hp(2),
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGray,
      zIndex: 1,
    },
    headerContent: {
      alignItems: 'center',
      paddingHorizontal: wp(6),
    },
    headerIcon: {
      width: wp(12),
      height: wp(12),
      marginBottom: hp(2),
    },
    title: {
      fontSize: fontSize(32),
      fontFamily: fonts.black,
      color: colors.black,
      marginBottom: hp(1),
    },
    subtitle: {
      fontSize: fontSize(16),
      fontFamily: fonts.regular,
      color: colors.black,
      opacity: 0.7,
      textAlign: 'center',
    },
    tabView: {
      flex: 1,
    },
    tabBar: {
      backgroundColor: colors.white,
      elevation: 0,
      shadowOpacity: 0,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGray,
      height: hp(8),
    },
    tabIndicator: {
      backgroundColor: colors.gold,
      height: 2,
      borderRadius: 1,
    },
    tabItemContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      height: hp(8),
      width: wp(50),
    },
    tabItem: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: hp(1),
      paddingHorizontal: wp(4),
    },
    tabItemText: {
      fontSize: fontSize(14),
      marginBottom: hp(0.5),
    },
    activeIndicator: {
      position: 'absolute',
      bottom: -hp(1),
      width: wp(4),
      height: 2,
      backgroundColor: colors.gold,
      borderRadius: 1,
    },
  });

export default JournalScreen;
