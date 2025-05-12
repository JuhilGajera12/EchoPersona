import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  Modal,
} from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {wp, hp, fontSize} from '../helpers/globalFunction';
import {colors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {icons} from '../constant/icons';

interface HistoricalProfile {
  summary: string;
  traits: string[];
  timestamp: string;
}

interface ComparisonResult {
  changes: string[];
  insights: string;
}

const {width} = Dimensions.get('window');
const TIMELINE_ITEM_WIDTH = width;
const TIMELINE_SPACING = wp(2.13);

const EvolutionScreen = () => {
  const [profiles, setProfiles] = useState<HistoricalProfile[]>([]);
  const [selectedProfile, setSelectedProfile] =
    useState<HistoricalProfile | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonResult, setComparisonResult] =
    useState<ComparisonResult | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProfiles();
    checkPremiumStatus();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadProfiles = async () => {
    try {
      const savedProfiles = await AsyncStorage.getItem('historicalProfiles');
      if (savedProfiles) {
        const parsedProfiles = JSON.parse(savedProfiles);
        setProfiles(parsedProfiles);
        if (parsedProfiles.length > 0) {
          setSelectedProfile(parsedProfiles[0]);
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({x: 0, animated: true});
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
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

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCompare = async () => {
    if (!isPremium) {
      // Navigate to premium screen or show upgrade modal
      return;
    }

    if (profiles.length < 2) return;

    const currentProfile = profiles[0];
    const previousProfile = selectedProfile;

    // This is a placeholder for the actual Gemini API integration
    // In a real app, you would send both profiles to Gemini for comparison
    const mockComparison: ComparisonResult = {
      changes: [
        'More focused on personal growth',
        'Increased emotional awareness',
        'Stronger sense of purpose',
      ],
      insights:
        "Your journey shows significant growth in self-awareness and emotional intelligence. You've become more intentional about personal development and have developed a clearer vision for your future.",
    };

    setComparisonResult(mockComparison);
    setShowComparison(true);
  };

  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {x: scrollX}}}],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(
          offsetX / (TIMELINE_ITEM_WIDTH + TIMELINE_SPACING),
        );
        if (index !== currentIndex && index >= 0 && index < profiles.length) {
          setCurrentIndex(index);
          setSelectedProfile(profiles[index]);
        }
      },
    },
  );

  const scrollToIndex = (index: number) => {
    if (index >= 0 && index < profiles.length) {
      scrollViewRef.current?.scrollTo({
        x: index * (TIMELINE_ITEM_WIDTH + TIMELINE_SPACING),
        animated: true,
      });
      setCurrentIndex(index);
      setSelectedProfile(profiles[index]);
    }
  };

  const renderTimelineNode = (profile: HistoricalProfile, index: number) => {
    const isSelected = currentIndex === index;
    const inputRange = [
      (index - 1) * (TIMELINE_ITEM_WIDTH + TIMELINE_SPACING),
      index * (TIMELINE_ITEM_WIDTH + TIMELINE_SPACING),
      (index + 1) * (TIMELINE_ITEM_WIDTH + TIMELINE_SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1.2, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        key={profile.timestamp}
        style={[styles.timelineItem, {width: TIMELINE_ITEM_WIDTH}]}
        onPress={() => scrollToIndex(index)}>
        <View style={styles.timelineNode}>
          <Animated.View
            style={[
              styles.timelineDot,
              {
                transform: [{scale}],
                opacity,
              },
            ]}
          />
          {index < profiles.length - 1 && (
            <Animated.View
              style={[
                styles.timelineLine,
                {
                  opacity,
                },
              ]}
            />
          )}
        </View>
        <Animated.Text
          style={[
            styles.timelineDate,
            {
              opacity,
              transform: [{scale}],
            },
          ]}>
          {formatDate(profile.timestamp)}
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, {opacity: fadeAnim}]}>
        <Text style={styles.title}>Your Evolution</Text>
        <Text style={styles.subtitle}>Track your personal growth journey</Text>
      </Animated.View>

      <View style={styles.timelineWrapper}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.timelineContainer}
          contentContainerStyle={styles.timelineContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={TIMELINE_ITEM_WIDTH + TIMELINE_SPACING}
          snapToAlignment="center">
          {profiles.map(renderTimelineNode)}
        </ScrollView>
      </View>

      {selectedProfile ? (
        <Animated.ScrollView
          style={[styles.profileContainer, {opacity: fadeAnim}]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Image
                source={icons.user}
                style={styles.profileIcon}
                tintColor={colors.teal}
                resizeMode="contain"
              />
              <Text style={styles.profileDate}>
                {formatDate(selectedProfile.timestamp)}
              </Text>
            </View>

            <Text style={styles.profileSummary}>{selectedProfile.summary}</Text>

            <View style={styles.traitsContainer}>
              {selectedProfile.traits.map((trait, index) => (
                <View key={index} style={styles.traitBadge}>
                  <Text style={styles.traitText}>{trait}</Text>
                </View>
              ))}
            </View>

            {isPremium && profiles.length > 1 && (
              <TouchableOpacity
                style={styles.compareButton}
                onPress={handleCompare}>
                <Image
                  source={icons.compare}
                  style={styles.compareIcon}
                  tintColor={colors.teal}
                  resizeMode="contain"
                />
                <Text style={styles.compareButtonText}>Compare with Today</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Image
            source={icons.evolution}
            style={styles.emptyStateIcon}
            tintColor={colors.teal}
            resizeMode="contain"
          />
          <Text style={styles.emptyStateText}>
            Your evolution timeline will appear here as you continue journaling
          </Text>
        </View>
      )}

      <Modal
        visible={showComparison}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowComparison(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Growth Insights</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowComparison(false)}>
                <Image
                  source={icons.close}
                  style={styles.closeIcon}
                  tintColor={colors.navy}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {comparisonResult && (
              <>
                <Text style={styles.insightsText}>
                  {comparisonResult.insights}
                </Text>

                <Text style={styles.changesTitle}>Key Changes:</Text>
                {comparisonResult.changes.map((change, index) => (
                  <View key={index} style={styles.changeItem}>
                    <Image
                      source={icons.add}
                      style={styles.changeIcon}
                      tintColor={colors.teal}
                      resizeMode="contain"
                    />
                    <Text style={styles.changeText}>{change}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    padding: wp(5.33),
    backgroundColor: colors.white,
  },
  title: {
    fontSize: fontSize(28),
    fontFamily: fonts.bold,
    color: colors.navy,
    marginBottom: hp(0.5),
  },
  subtitle: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.navy,
    opacity: 0.7,
  },
  timelineWrapper: {
    height: hp(12),
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  timelineContainer: {
    flexGrow: 0,
  },
  timelineContent: {
    paddingHorizontal: (width - TIMELINE_ITEM_WIDTH) / 2,
    alignItems: 'center',
  },
  timelineItem: {
    alignItems: 'center',
    paddingTop: hp(2),
    marginHorizontal: TIMELINE_SPACING / 2,
  },
  timelineNode: {
    alignItems: 'center',
    position: 'relative',
  },
  timelineDot: {
    width: wp(4.26),
    height: wp(4.26),
    borderRadius: wp(2.13),
    backgroundColor: colors.teal,
    opacity: 0.5,
  },
  timelineLine: {
    position: 'absolute',
    top: wp(2.13),
    width: TIMELINE_ITEM_WIDTH,
    height: 2,
    backgroundColor: colors.navy,
  },
  timelineDate: {
    marginTop: hp(1),
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.navy,
    opacity: 0.7,
  },
  profileContainer: {
    flex: 1,
    padding: wp(5.33),
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: wp(3.2),
    padding: wp(5.33),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  profileIcon: {
    width: wp(6.4),
    height: wp(6.4),
    marginRight: wp(2.13),
  },
  profileDate: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.navy,
  },
  profileSummary: {
    fontSize: fontSize(18),
    lineHeight: hp(3),
    color: colors.navy,
    fontFamily: fonts.regular,
    marginBottom: hp(2),
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -wp(1.066),
    marginBottom: hp(2),
  },
  traitBadge: {
    backgroundColor: colors.teal,
    paddingHorizontal: wp(3.2),
    paddingVertical: hp(0.5),
    borderRadius: hp(1.97),
    margin: wp(1.066),
  },
  traitText: {
    color: colors.beige,
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
    padding: wp(4.26),
    borderRadius: wp(2.13),
    marginTop: hp(2),
  },
  compareIcon: {
    width: wp(5.33),
    height: wp(5.33),
    marginRight: wp(2.13),
  },
  compareButtonText: {
    fontSize: fontSize(18),
    fontFamily: fonts.bold,
    color: colors.teal,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(5.33),
  },
  emptyStateIcon: {
    width: wp(21.33),
    height: wp(21.33),
    marginBottom: hp(2),
    opacity: 0.5,
  },
  emptyStateText: {
    fontSize: fontSize(18),
    fontFamily: fonts.regular,
    color: colors.navy,
    textAlign: 'center',
    opacity: 0.7,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: wp(5.33),
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: wp(3.2),
    padding: wp(5.33),
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  modalTitle: {
    fontSize: fontSize(24),
    fontFamily: fonts.bold,
    color: colors.navy,
  },
  closeButton: {
    padding: wp(2.13),
  },
  closeIcon: {
    width: wp(5.33),
    height: wp(5.33),
  },
  insightsText: {
    fontSize: fontSize(18),
    fontFamily: fonts.regular,
    color: colors.navy,
    lineHeight: hp(3),
    marginBottom: hp(2),
  },
  changesTitle: {
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
    color: colors.navy,
    marginBottom: hp(1),
  },
  changeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  changeIcon: {
    width: wp(4.26),
    height: wp(4.26),
    marginRight: wp(2.13),
  },
  changeText: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.navy,
    flex: 1,
  },
});

export default EvolutionScreen;
