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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {colors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {icons} from '../constant/icons';

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

interface HistoricalProfile {
  summary: string;
  traits: string[];
  timestamp: string;
}

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [profile, setProfile] = useState<PersonaProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadProfile();
    checkPremiumStatus();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('currentProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);

        // If this is the first time loading the profile, save it as historical
        const hasHistoricalProfiles = await AsyncStorage.getItem(
          'historicalProfiles',
        );
        if (!hasHistoricalProfiles) {
          await saveHistoricalProfile(parsedProfile);
        }
      } else {
        // Generate initial profile based on journal entries
        await generateProfile();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const premiumStatus = await AsyncStorage.getItem('isPremium');
      setIsPremium(premiumStatus === 'true');
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const saveHistoricalProfile = async (profile: PersonaProfile) => {
    try {
      const historicalProfile: HistoricalProfile = {
        summary: profile.summary,
        traits: profile.traits,
        timestamp: profile.lastUpdated,
      };

      const existingProfiles = await AsyncStorage.getItem('historicalProfiles');
      const profiles: HistoricalProfile[] = existingProfiles
        ? JSON.parse(existingProfiles)
        : [];

      // Add new profile at the beginning of the array
      profiles.unshift(historicalProfile);

      // Keep only the last 10 profiles to prevent storage from growing too large
      const trimmedProfiles = profiles.slice(0, 10);

      await AsyncStorage.setItem(
        'historicalProfiles',
        JSON.stringify(trimmedProfiles),
      );
    } catch (error) {
      console.error('Error saving historical profile:', error);
    }
  };

  const generateProfile = async () => {
    try {
      const entries = await AsyncStorage.getItem('journalEntries');
      if (!entries) return;

      // This is a placeholder for the actual Gemini API integration
      // In a real app, you would send the entries to Gemini and get a profile back
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

      setProfile(mockProfile);
      await AsyncStorage.setItem('currentProfile', JSON.stringify(mockProfile));

      // Save this as a historical profile
      await saveHistoricalProfile(mockProfile);
    } catch (error) {
      console.error('Error generating profile:', error);
    }
  };

  const handleRegenerateProfile = async () => {
    if (!isPremium) {
      // Navigate to premium screen or show upgrade modal
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
