import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {colors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {icons} from '../constant/icons';
import {RootState} from '../store';
import {
  setCurrentProfile,
  addHistoricalProfile,
} from '../store/slices/profileSlice';

type RootStackParamList = {
  Settings: undefined;
  Premium: undefined;
  MainTabs: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PersonaProfile {
  summary: string;
  traits: string[];
  lastUpdated: string;
}

const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const profile = useSelector(
    (state: RootState) => state.profile.currentProfile,
  );
  const isPremium = useSelector((state: RootState) => state.premium.isPremium);

  useEffect(() => {
    loadProfile();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadProfile = async () => {
    try {
      if (!profile) {
        await generateProfile();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateProfile = async () => {
    try {
      const mockProfile: PersonaProfile = {
        summary:
          "You are a thoughtful and introspective individual who values personal growth and self-awareness. Your journal entries show a deep appreciation for life's meaningful moments and a desire to understand yourself better.",
        traits: [
          'Introspective',
          'Growth-oriented',
          'Self-aware',
          'Thoughtful',
          'Curious',
        ],
        lastUpdated: new Date().toISOString(),
      };

      dispatch(setCurrentProfile(mockProfile));
      dispatch(
        addHistoricalProfile({
          summary: mockProfile.summary,
          traits: mockProfile.traits,
          timestamp: mockProfile.lastUpdated,
        }),
      );
    } catch (error) {
      console.error('Error generating profile:', error);
    }
  };

  const handleRegenerateProfile = async () => {
    if (!isPremium) return;
    setIsLoading(true);
    await generateProfile();
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <Animated.View
        style={[
          styles.header,
          {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
        ]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Who You Are Right Now</Text>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}>
              <Image
                source={icons.setting}
                style={styles.settingsIcon}
                tintColor={colors.black}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.lastUpdatedContainer}>
            <Image
              source={icons.calendar}
              style={styles.calendarIcon}
              tintColor={colors.gold}
              resizeMode="contain"
            />
            <Text style={styles.lastUpdated}>
              Last updated:{' '}
              {profile?.lastUpdated
                ? new Date(profile.lastUpdated).toLocaleDateString()
                : 'Never'}
            </Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={[
            styles.summaryCard,
            {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
          ]}>
          <View style={styles.summaryHeader}>
            <Image
              source={icons.user}
              style={styles.summaryIcon}
              tintColor={colors.white}
              resizeMode="contain"
            />
            <Text style={styles.summaryTitle}>Your Summary</Text>
          </View>
          <Text style={styles.summaryText}>{profile?.summary}</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.traitsContainer,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <View style={styles.traitsHeader}>
            <Image
              source={icons.evolution}
              style={styles.traitsIcon}
              tintColor={colors.gold}
              resizeMode="contain"
            />
            <Text style={styles.traitsTitle}>Your Traits</Text>
          </View>
          <View style={styles.traitsList}>
            {profile?.traits.map((trait, index) => (
              <View key={index} style={styles.traitBadge}>
                <Text style={styles.traitText}>{trait}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <TouchableOpacity
          style={[
            styles.regenerateButton,
            !isPremium && styles.regenerateButtonDisabled,
          ]}
          onPress={handleRegenerateProfile}
          disabled={!isPremium}
          activeOpacity={0.8}>
          <View style={styles.regenerateButtonContent}>
            <Image
              source={icons.premium}
              resizeMode="contain"
              style={styles.upgradeIcon}
              tintColor={colors.white}
            />
            <Text style={styles.regenerateButtonText}>
              {isPremium ? 'Regenerate Profile' : 'Upgrade to Regenerate'}
            </Text>
          </View>
          {!isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>PRO</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? hp(6) : STATUS_BAR_HEIGHT + hp(2),
    paddingBottom: hp(2),
    backgroundColor: colors.white,
  },
  headerContent: {
    paddingHorizontal: wp(5),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  title: {
    fontSize: fontSize(32),
    fontFamily: fonts.black,
    color: colors.black,
  },
  settingsButton: {
    padding: wp(2),
  },
  settingsIcon: {
    width: wp(6),
    height: wp(6),
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    width: wp(4),
    height: wp(4),
    marginRight: wp(2),
  },
  lastUpdated: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.sand,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingBottom: hp(4),
  },
  summaryCard: {
    backgroundColor: colors.gold,
    borderRadius: wp(4),
    padding: wp(5),
    marginBottom: hp(3),
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  summaryIcon: {
    width: wp(6),
    height: wp(6),
    marginRight: wp(3),
  },
  summaryTitle: {
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
    color: colors.black,
  },
  summaryText: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.black,
    lineHeight: hp(2.6),
  },
  traitsContainer: {
    backgroundColor: colors.white,
    borderRadius: wp(4),
    padding: wp(5),
    marginBottom: hp(3),
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  traitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  traitsIcon: {
    width: wp(6),
    height: wp(6),
    marginRight: wp(3),
  },
  traitsTitle: {
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
    color: colors.black,
  },
  traitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -wp(1),
  },
  traitBadge: {
    backgroundColor: colors.lightGray,
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: wp(4),
    margin: wp(1),
  },
  traitText: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.black,
  },
  regenerateButton: {
    backgroundColor: colors.black,
    borderRadius: wp(4),
    padding: wp(5),
    marginTop: hp(2),
  },
  regenerateButtonDisabled: {
    opacity: 0.7,
  },
  regenerateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeIcon: {
    width: wp(5),
    height: wp(5),
    marginRight: wp(2),
  },
  regenerateButtonText: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.white,
  },
  premiumBadge: {
    position: 'absolute',
    top: -hp(1),
    right: -wp(2),
    backgroundColor: colors.gold,
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(2),
    borderRadius: wp(2),
  },
  premiumBadgeText: {
    fontSize: fontSize(12),
    fontFamily: fonts.bold,
    color: colors.black,
  },
});

export default ProfileScreen;
