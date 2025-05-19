import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import {useColors, Colors} from '../../constant/colors';
import {fonts} from '../../constant/fonts';
import {fontSize, hp, wp} from '../../helpers/globalFunction';

interface StreakBadgeProps {
  currentStreak: number;
  bestStreak: number;
  animatedValue?: Animated.SharedValue<number>;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  currentStreak,
  bestStreak,
  animatedValue,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const colors = useColors();
  const styles = createStyles(colors);

  useEffect(() => {
    if (animatedValue) {
      opacity.value = withTiming(1, {duration: 300});
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [currentStreak, animatedValue]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        {
          scale: interpolate(scale.value, [0, 1], [0.95, 1], Extrapolate.CLAMP),
        },
      ],
    };
  });

  const flameStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(1 + (currentStreak > 0 ? 0.1 : 0), {
            damping: 8,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.streakContainer}>
        <View style={styles.currentStreakContainer}>
          <Text style={styles.streakLabel}>Current Streak</Text>
          <Animated.Text style={styles.streakValue}>
            {currentStreak}
          </Animated.Text>
          <Text style={styles.streakUnit}>days</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.bestStreakContainer}>
          <Text style={styles.streakLabel}>Best Streak</Text>
          <Animated.Text style={styles.streakValue}>{bestStreak}</Animated.Text>
          <Text style={styles.streakUnit}>days</Text>
        </View>
        <Animated.View style={[styles.flameContainer, flameStyle]}>
          <Text style={styles.flameEmoji}>🔥</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: hp(1),
      paddingHorizontal: wp(2),
      backgroundColor: 'transparent',
    },
    streakContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    currentStreakContainer: {
      alignItems: 'center',
      paddingHorizontal: wp(4.26),
    },
    bestStreakContainer: {
      alignItems: 'center',
      paddingHorizontal: wp(4.26),
    },
    streakLabel: {
      fontFamily: fonts.bold,
      fontSize: fontSize(10),
      color: colors.black,
      opacity: 0.7,
      marginBottom: hp(0.2),
    },
    streakValue: {
      fontFamily: fonts.bold,
      fontSize: fontSize(18),
      color: colors.black,
      marginBottom: hp(0.1),
    },
    streakUnit: {
      fontFamily: fonts.regular,
      fontSize: fontSize(10),
      color: colors.black,
      opacity: 0.7,
    },
    divider: {
      width: 1,
      height: hp(3),
      backgroundColor: colors.black,
      opacity: 0.2,
      marginHorizontal: wp(2),
    },
    flameContainer: {
      width: wp(8),
      height: wp(8),
      borderRadius: wp(4),
      backgroundColor: colors.black + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: wp(2),
    },
    flameEmoji: {
      fontSize: fontSize(16),
    },
  });
