import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
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

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  const profile = useSelector(
    (state: RootState) => state.profile.currentProfile,
  );
  const isPremium = useSelector((state: RootState) => state.premium.isPremium);

  useEffect(() => {
    loadProfile();
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
    if (!isPremium) {
      return;
    }
    setIsLoading(true);
    await generateProfile();
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Who You Are Right Now</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}>
            <Image
              source={icons.setting}
              style={styles.settingsIcon}
              tintColor={colors.navy}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.lastUpdated}>
          Last updated:{' '}
          {profile?.lastUpdated
            ? new Date(profile.lastUpdated).toLocaleDateString()
            : 'Never'}
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>{profile?.summary}</Text>
      </View>

      <View style={styles.traitsContainer}>
        <Text style={styles.traitsTitle}>Your Traits</Text>
        <View style={styles.traitsList}>
          {profile?.traits.map((trait, index) => (
            <View key={index} style={styles.traitBadge}>
              <Text style={styles.traitText}>{trait}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.regenerateButton,
          !isPremium && styles.regenerateButtonDisabled,
        ]}
        onPress={handleRegenerateProfile}
        disabled={!isPremium}>
        <Image
          source={icons.premium}
          resizeMode="contain"
          style={styles.upgradeIcon}
          tintColor={colors.beige}
        />
        <Text style={styles.regenerateButtonText}>
          {isPremium ? 'Regenerate Profile' : 'Upgrade to Regenerate'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingVertical: wp(5.33),
    margin: wp(5.33),
    borderRadius: wp(3.2),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: wp(2.13),
  },
  title: {
    fontSize: fontSize(28),
    fontFamily: fonts.bold,
    color: colors.navy,
    marginBottom: wp(2.13),
  },
  lastUpdated: {
    fontSize: fontSize(16),
    color: colors.navy,
  },
  summaryCard: {
    marginHorizontal: wp(5.33),
    padding: wp(5.33),
    backgroundColor: colors.teal,
    borderRadius: wp(3.2),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    fontSize: fontSize(18),
    lineHeight: hp(3),
    color: colors.beige,
    fontFamily: fonts.regular,
  },
  traitsContainer: {
    padding: wp(5.33),
  },
  traitsTitle: {
    fontSize: fontSize(22),
    fontFamily: fonts.bold,
    color: colors.navy,
    marginBottom: hp(1.97),
  },
  traitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: wp(-1.066),
  },
  traitBadge: {
    backgroundColor: colors.navy,
    paddingHorizontal: wp(3.2),
    paddingVertical: wp(1.6),
    borderRadius: hp(1.97),
    margin: wp(1.066),
  },
  traitText: {
    color: colors.beige,
    fontSize: fontSize(18),
    fontFamily: fonts.bold,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: wp(5.33),
    padding: wp(4.26),
    backgroundColor: colors.teal,
    borderRadius: wp(3.2),
  },
  regenerateButtonDisabled: {
    opacity: 0.6,
  },
  regenerateButtonText: {
    marginLeft: wp(2.13),
    fontSize: fontSize(22),
    fontFamily: fonts.bold,
    color: colors.beige,
  },
  upgradeIcon: {
    height: wp(6.4),
    width: wp(6.4),
  },
  settingsButton: {
    padding: wp(2.13),
  },
  settingsIcon: {
    width: wp(6.4),
    height: wp(6.4),
  },
});

export default ProfileScreen;
