import React, {useState, useEffect, useRef, useCallback} from 'react';
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
  Platform,
  StatusBar,
  FlatList,
} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState} from '../store';
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
const TIMELINE_ITEM_WIDTH = wp(80);
const TIMELINE_SPACING = wp(4);

const EvolutionScreen = () => {
  const profiles = useSelector(
    (state: RootState) => state.profile.historicalProfiles,
  );
  const isPremium = useSelector((state: RootState) => state.premium.isPremium);
  const [selectedProfile, setSelectedProfile] =
    useState<HistoricalProfile | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonResult, setComparisonResult] =
    useState<ComparisonResult | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [currentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (profiles.length > 0) {
      setSelectedProfile(profiles[0]);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({x: 0, animated: true});
      }, 100);
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [profiles, fadeAnim]);

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
      return;
    }

    if (profiles.length < 2) {
      return;
    }

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

  const scrollToIndex = (index: number) => {
    if (index >= 0 && index < profiles.length) {
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  const renderTimelineItem = useCallback(
    ({item, index}: {item: HistoricalProfile; index: number}) => (
      <TouchableOpacity
        style={[
          styles.timelineNode,
          index === currentIndex && styles.timelineNodeActive,
        ]}
        onPress={() => scrollToIndex(index)}>
        <View style={styles.timelineNodeContent}>
          <View style={styles.timelineDot} />
          <Text style={styles.timelineDate}>{formatDate(item.timestamp)}</Text>
          <Text style={styles.timelineSummary} numberOfLines={2}>
            {item.summary}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [currentIndex, scrollToIndex],
  );

  const keyExtractor = useCallback(
    (item: HistoricalProfile) => item.timestamp,
    [],
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <Animated.View style={[styles.header, {opacity: fadeAnim}]}>
        <View style={styles.headerContent}>
          <Image
            source={icons.evolution}
            style={styles.headerIcon}
            tintColor={colors.teal}
            resizeMode="contain"
          />
          <Text style={styles.title}>Your Evolution</Text>
          <Text style={styles.subtitle}>
            Track your personal growth journey
          </Text>
        </View>
      </Animated.View>

      <View style={styles.timelineSection}>
        <FlatList
          ref={flatListRef}
          data={profiles}
          renderItem={renderTimelineItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToAlignment="center"
          contentContainerStyle={styles.timelineContent}
          removeClippedSubviews={true}
        />
      </View>

      {selectedProfile ? (
        <Animated.ScrollView
          style={[styles.profileContainer, {opacity: fadeAnim}]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.profileContent}>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileIconContainer}>
                <Image
                  source={icons.user}
                  style={styles.profileIcon}
                  tintColor={colors.white}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.profileHeaderText}>
                <Text style={styles.profileDate}>
                  {formatDate(selectedProfile.timestamp)}
                </Text>
                <Text style={styles.profileLabel}>Persona Profile</Text>
              </View>
            </View>

            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.profileSummary}>
                {selectedProfile.summary}
              </Text>
            </View>

            <View style={styles.traitsSection}>
              <Text style={styles.sectionTitle}>Key Traits</Text>
              <View style={styles.traitsContainer}>
                {selectedProfile.traits.map((trait, index) => (
                  <View key={index} style={styles.traitBadge}>
                    <Text style={styles.traitText}>{trait}</Text>
                  </View>
                ))}
              </View>
            </View>

            {isPremium && profiles.length > 1 && (
              <TouchableOpacity
                style={styles.compareButton}
                onPress={handleCompare}>
                <Image
                  source={icons.compare}
                  style={styles.compareIcon}
                  tintColor={colors.white}
                  resizeMode="contain"
                />
                <Text style={styles.compareButtonText}>Compare with Today</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.ScrollView>
      ) : (
        <Animated.View style={[styles.emptyState, {opacity: fadeAnim}]}>
          <Image
            source={icons.evolution}
            style={styles.emptyStateIcon}
            tintColor={colors.teal}
            resizeMode="contain"
          />
          <Text style={styles.emptyStateTitle}>No Profiles Yet</Text>
          <Text style={styles.emptyStateText}>
            Your evolution timeline will appear here as you continue journaling
          </Text>
        </Animated.View>
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
              <ScrollView style={styles.modalScroll}>
                <View style={styles.insightsSection}>
                  <Text style={styles.insightsTitle}>Key Insights</Text>
                  <Text style={styles.insightsText}>
                    {comparisonResult.insights}
                  </Text>
                </View>

                <View style={styles.changesSection}>
                  <Text style={styles.changesTitle}>Notable Changes</Text>
                  {comparisonResult.changes.map((change, index) => (
                    <View key={index} style={styles.changeItem}>
                      <View style={styles.changeIconContainer}>
                        <Image
                          source={icons.add}
                          style={styles.changeIcon}
                          tintColor={colors.white}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={styles.changeText}>{change}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
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
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'ios' ? hp(6) : hp(4),
    paddingBottom: hp(4),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
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
    color: colors.navy,
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.navy,
    opacity: 0.7,
    textAlign: 'center',
  },
  timelineSection: {
    backgroundColor: colors.white,
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  timelineContainer: {
    flexGrow: 0,
  },
  timelineContent: {
    paddingHorizontal: (width - TIMELINE_ITEM_WIDTH) / 2,
  },
  timelineNode: {
    width: TIMELINE_ITEM_WIDTH,
    marginHorizontal: TIMELINE_SPACING / 2,
    backgroundColor: colors.white,
    borderRadius: wp(4),
    padding: wp(4),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineNodeActive: {
    backgroundColor: colors.teal,
  },
  timelineNodeContent: {
    alignItems: 'center',
  },
  timelineDot: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
    backgroundColor: colors.navy,
    marginBottom: hp(1),
  },
  timelineDate: {
    fontSize: fontSize(14),
    fontFamily: fonts.bold,
    color: colors.navy,
    marginBottom: hp(1),
  },
  timelineSummary: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.navy,
    opacity: 0.7,
    textAlign: 'center',
  },
  profileContainer: {
    flex: 1,
  },
  profileContent: {
    padding: wp(6),
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: wp(4),
    padding: wp(6),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(4),
  },
  profileIconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(4),
  },
  profileIcon: {
    width: wp(6),
    height: wp(6),
  },
  profileHeaderText: {
    flex: 1,
  },
  profileDate: {
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
    color: colors.navy,
    marginBottom: hp(0.5),
  },
  profileLabel: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.navy,
    opacity: 0.7,
  },
  summarySection: {
    marginBottom: hp(4),
  },
  sectionTitle: {
    fontSize: fontSize(18),
    fontFamily: fonts.bold,
    color: colors.navy,
    marginBottom: hp(2),
  },
  profileSummary: {
    fontSize: fontSize(16),
    lineHeight: hp(3),
    color: colors.navy,
    fontFamily: fonts.regular,
  },
  traitsSection: {
    marginBottom: hp(4),
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -wp(2),
  },
  traitBadge: {
    backgroundColor: colors.teal,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: hp(2),
    margin: wp(2),
  },
  traitText: {
    color: colors.white,
    fontSize: fontSize(14),
    fontFamily: fonts.bold,
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    padding: wp(4),
    borderRadius: wp(3),
    marginTop: hp(2),
  },
  compareIcon: {
    width: wp(5),
    height: wp(5),
    marginRight: wp(2),
  },
  compareButtonText: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(6),
  },
  emptyStateIcon: {
    width: wp(24),
    height: wp(24),
    marginBottom: hp(4),
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: fontSize(24),
    fontFamily: fonts.bold,
    color: colors.navy,
    marginBottom: hp(2),
  },
  emptyStateText: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.navy,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: hp(2.5),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: wp(6),
    borderTopRightRadius: wp(6),
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(6),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: fontSize(24),
    fontFamily: fonts.bold,
    color: colors.navy,
  },
  closeButton: {
    padding: wp(2),
  },
  closeIcon: {
    width: wp(5),
    height: wp(5),
  },
  modalScroll: {
    padding: wp(6),
  },
  insightsSection: {
    marginBottom: hp(4),
  },
  insightsTitle: {
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
    color: colors.navy,
    marginBottom: hp(2),
  },
  insightsText: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.navy,
    lineHeight: hp(2.5),
  },
  changesSection: {
    marginBottom: hp(4),
  },
  changesTitle: {
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
    color: colors.navy,
    marginBottom: hp(2),
  },
  changeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  changeIconContainer: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: colors.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  changeIcon: {
    width: wp(4),
    height: wp(4),
  },
  changeText: {
    flex: 1,
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.navy,
    lineHeight: hp(2.5),
  },
});

export default EvolutionScreen;
