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
import {colors} from '../../constant/colors';
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: wp(4),
    padding: wp(4),
    marginHorizontal: wp(5),
    marginVertical: hp(1),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentStreakContainer: {
    flex: 1,
    alignItems: 'center',
  },
  bestStreakContainer: {
    flex: 1,
    alignItems: 'center',
  },
  streakLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize(12),
    color: colors.sand,
    marginBottom: hp(0.5),
  },
  streakValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize(24),
    color: colors.black,
    marginBottom: hp(0.2),
  },
  streakUnit: {
    fontFamily: fonts.light,
    fontSize: fontSize(12),
    color: colors.sand,
  },
  divider: {
    width: 1,
    height: hp(4),
    backgroundColor: colors.black,
    marginHorizontal: wp(2),
  },
  flameContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: colors.gold + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp(2),
  },
  flameEmoji: {
    fontSize: fontSize(20),
  },
});
