import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  Modal,
  ActivityIndicator,
  ViewStyle,
  Animated,
  Easing,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../store';
import {setPremiumStatus} from '../store/slices/premiumSlice';
import {icons} from '../constant/icons';
import {colors} from '../constant/colors';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {fonts} from '../constant/fonts';
import LinearGradient from 'react-native-linear-gradient';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const ANIMATION_DURATION = 300;

interface PremiumFeature {
  icon: any;
  title: string;
  description: string;
  isPremium: boolean;
}

const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    icon: icons.chart,
    title: 'Weekly Persona Profiles',
    description:
      'Get detailed insights about your personality evolution every week',
    isPremium: true,
  },
  {
    icon: icons.compare,
    title: 'Comparison Insights',
    description: 'Compare your current self with past versions to track growth',
    isPremium: true,
  },
  {
    icon: icons.voice,
    title: 'Voice Journaling',
    description: 'Record your thoughts and get them transcribed automatically',
    isPremium: true,
  },
  {
    icon: icons.email,
    title: 'Future Self Letters',
    description: 'Receive AI-generated letters from your future self',
    isPremium: true,
  },
  {
    icon: icons.premium,
    title: 'Private Entries',
    description: 'Lock sensitive journal entries with encryption',
    isPremium: true,
  },
  {
    icon: icons.search,
    title: 'Data Export',
    description: 'Export your journal and persona data anytime',
    isPremium: true,
  },
];

const FREE_FEATURES: PremiumFeature[] = [
  {
    icon: icons.journal,
    title: 'Daily Journaling',
    description: 'Write and reflect on daily prompts',
    isPremium: false,
  },
  {
    icon: icons.user,
    title: 'Basic Profile',
    description: 'View your current personality profile',
    isPremium: false,
  },
  {
    icon: icons.evolution,
    title: 'Monthly Evolution',
    description: 'Track your growth on a monthly basis',
    isPremium: false,
  },
];

const PremiumScreen = () => {
  const dispatch = useDispatch();
  const isPremium = useSelector((state: RootState) => state.premium.isPremium);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>(
    'yearly',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 1500));
      dispatch(setPremiumStatus(true));
    } catch (error) {
      setError('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFeatureItem = (feature: PremiumFeature, index: number) => (
    <View key={index} style={styles.featureItem}>
      <View
        style={[
          styles.featureIconContainer,
          feature.isPremium && styles.premiumFeatureIcon,
        ]}>
        <Image
          source={feature.icon}
          style={styles.featureIcon}
          tintColor={feature.isPremium ? colors.white : colors.black}
          resizeMode="contain"
        />
      </View>
      <View style={styles.featureTextContainer}>
        <Text
          style={[
            styles.featureTitle,
            feature.isPremium && styles.premiumFeatureTitle,
          ]}>
          {feature.title}
        </Text>
        <Text
          style={[
            styles.featureDescription,
            feature.isPremium && styles.premiumFeatureDescription,
          ]}>
          {feature.description}
        </Text>
      </View>
    </View>
  );

  if (isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.black} />
        <LinearGradient
          colors={[colors.black, '#1a1a1a']}
          style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View style={styles.premiumBadge}>
              <Image
                source={icons.premium}
                style={styles.premiumIcon}
                tintColor={colors.gold}
                resizeMode="contain"
              />
              <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            </View>
            <Text style={styles.premiumTitle}>You're Premium!</Text>
            <Text style={styles.premiumSubtitle}>
              Enjoy all premium features and benefits
            </Text>
          </View>
        </LinearGradient>

        <Text style={[styles.sectionTitle, styles.premiumFeatureText]}>
          Your Premium Features
        </Text>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.featuresSection}>
            {PREMIUM_FEATURES.map(renderFeatureItem)}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.black} />
      <LinearGradient
        colors={[colors.black, '#1a1a1a']}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>
            Unlock all features and transform your self-discovery journey
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.plansContainer,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <View style={styles.planSelector}>
            <TouchableOpacity
              style={[
                styles.planButton,
                selectedPlan === 'monthly' && styles.planButtonActive,
              ]}
              onPress={() => setSelectedPlan('monthly')}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.planButtonText,
                  selectedPlan === 'monthly' && styles.planButtonTextActive,
                ]}>
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.planButton,
                selectedPlan === 'yearly' && styles.planButtonActive,
              ]}
              onPress={() => setSelectedPlan('yearly')}
              activeOpacity={0.8}>
              <View style={styles.yearlyButtonContent}>
                <Text
                  style={[
                    styles.planButtonText,
                    selectedPlan === 'yearly' && styles.planButtonTextActive,
                  ]}>
                  Yearly
                </Text>
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>Save 20%</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.planCard}>
            <LinearGradient
              colors={[colors.gold, '#FFD700']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.planGradient}>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>Premium Plan</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.currency}>$</Text>
                  <Text style={styles.planPrice}>
                    {selectedPlan === 'monthly' ? '4.99' : '47.99'}
                  </Text>
                  <Text style={styles.planPeriod}>
                    /{selectedPlan === 'monthly' ? 'month' : 'year'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgrade}
                disabled={isLoading}
                activeOpacity={0.8}>
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Premium Features</Text>
            {PREMIUM_FEATURES.map(renderFeatureItem)}
          </View>

          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Free Features</Text>
            {FREE_FEATURES.map(renderFeatureItem)}
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.terms}>
            By upgrading, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? hp(2) : hp(4),
    paddingBottom: hp(4),
    borderBottomLeftRadius: wp(4),
    borderBottomRightRadius: wp(4),
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: wp(6),
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(4),
    marginBottom: hp(2),
  },
  premiumIcon: {
    width: wp(5),
    height: wp(5),
    marginRight: wp(2),
  },
  premiumBadgeText: {
    color: colors.gold,
    fontSize: fontSize(14),
    fontFamily: fonts.bold,
  },
  premiumTitle: {
    fontSize: fontSize(32),
    fontFamily: fonts.bold,
    color: colors.white,
    marginBottom: hp(1),
    textAlign: 'center',
  },
  premiumSubtitle: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  title: {
    fontSize: fontSize(32),
    fontFamily: fonts.bold,
    color: colors.white,
    marginBottom: hp(1),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: hp(2.5),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? hp(5) : hp(3),
    paddingHorizontal: wp(6),
  },
  plansContainer: {
    paddingTop: hp(2),
  },
  planSelector: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    borderRadius: wp(3),
    padding: wp(1),
    marginBottom: hp(4),
  },
  planButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  planButtonActive: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  yearlyButtonContent: {
    alignItems: 'center',
  },
  planButtonText: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.black,
  },
  planButtonTextActive: {
    fontFamily: fonts.bold,
  },
  savingsBadge: {
    backgroundColor: colors.gold,
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(2),
    borderRadius: wp(2),
    marginTop: hp(0.5),
  },
  savingsText: {
    color: colors.white,
    fontSize: fontSize(12),
    fontFamily: fonts.bold,
  },
  planCard: {
    borderRadius: wp(6),
    overflow: 'hidden',
    marginBottom: hp(4),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  planGradient: {
    padding: wp(6),
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: hp(4),
  },
  planName: {
    fontSize: fontSize(24),
    fontFamily: fonts.bold,
    color: colors.white,
    marginBottom: hp(2),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  currency: {
    fontSize: fontSize(24),
    fontFamily: fonts.bold,
    color: colors.white,
    marginRight: wp(1),
  },
  planPrice: {
    fontSize: fontSize(48),
    fontFamily: fonts.bold,
    color: colors.white,
  },
  planPeriod: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.white,
    opacity: 0.8,
  },
  upgradeButton: {
    backgroundColor: colors.black,
    paddingVertical: hp(2),
    borderRadius: wp(3),
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: fontSize(18),
    fontFamily: fonts.bold,
    color: colors.white,
  },
  featuresSection: {
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
    color: colors.black,
    marginBottom: hp(2),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: wp(4),
    borderRadius: wp(4),
    marginBottom: hp(2),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(4),
  },
  premiumFeatureIcon: {
    backgroundColor: colors.gold,
  },
  featureIcon: {
    width: wp(6),
    height: wp(6),
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.black,
    marginBottom: hp(0.5),
  },
  premiumFeatureTitle: {
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    color: colors.black,
    marginBottom: hp(0.5),
  },
  featureDescription: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.sand,
    lineHeight: hp(2.5),
  },
  premiumFeatureDescription: {
    color: colors.sand,
    opacity: 0.9,
  },
  errorContainer: {
    backgroundColor: colors.lightGray,
    padding: wp(4),
    borderRadius: wp(3),
    marginBottom: hp(3),
  },
  errorText: {
    color: colors.black,
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  terms: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.sand,
    textAlign: 'center',
  },
  premiumFeatureText: {
    paddingHorizontal: wp(6),
    paddingTop: hp(2),
  },
});

export default PremiumScreen;
