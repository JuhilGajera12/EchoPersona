import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {icons} from '../constant/icons';
import {colors} from '../constant/colors';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {fonts} from '../constant/fonts';

// Stripe integration
const STRIPE_PUBLISHABLE_KEY = 'your_publishable_key'; // Replace with your Stripe key
const MONTHLY_PRICE_ID = 'price_monthly_id'; // Replace with your Stripe price ID
const YEARLY_PRICE_ID = 'price_yearly_id'; // Replace with your Stripe price ID

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
  const [isPremium, setIsPremium] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>(
    'monthly',
  );
  const [showComparison, setShowComparison] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const premiumStatus = await AsyncStorage.getItem('isPremium');
      setIsPremium(premiumStatus === 'true');
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real app, this would integrate with Stripe
      // Example Stripe integration:
      /*
      const response = await fetch('your_backend_url/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPlan === 'monthly' ? MONTHLY_PRICE_ID : YEARLY_PRICE_ID,
          successUrl: 'echopersona://premium/success',
          cancelUrl: 'echopersona://premium/cancel',
        }),
      });

      const { sessionId } = await response.json();
      await stripe.initPaymentSheet({
        paymentIntentClientSecret: sessionId,
        merchantDisplayName: 'EchoPersona',
      });
      await stripe.presentPaymentSheet();
      */

      // For now, simulate successful payment
      await new Promise(resolve => setTimeout(resolve, 1500));
      await AsyncStorage.setItem('isPremium', 'true');
      setIsPremium(true);
    } catch (error) {
      setError('Payment failed. Please try again.');
      console.error('Error upgrading to premium:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      // In a real app, this would generate and download a data export
      // For now, we'll just show a message
      console.log('Exporting data...');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const renderFeatureCard = (feature: PremiumFeature, index: number) => (
    <View key={index} style={styles.featureCard}>
      <View style={styles.featureIconWrapper}>
        <Image
          source={feature.icon}
          style={styles.featureIcon}
          tintColor={feature.isPremium ? colors.teal : colors.navy}
          resizeMode="contain"
        />
      </View>
      <View style={styles.featureContent}>
        <View style={styles.featureTitleRow}>
          <Text style={styles.featureTitle}>{feature.title}</Text>
          {feature.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>PRO</Text>
            </View>
          )}
        </View>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </View>
  );

  const renderComparisonModal = () => (
    <Modal
      visible={showComparison}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowComparison(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Your Plan</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowComparison(false)}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            {/* Free Plan */}
            <View style={styles.planCard}>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>Free</Text>
                <Text style={styles.planPrice}>$0</Text>
                <Text style={styles.planPeriod}>forever</Text>
              </View>
              <View style={styles.featuresList}>
                {FREE_FEATURES.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Image
                      source={icons.add}
                      style={styles.checkIcon}
                      tintColor={colors.teal}
                    />
                    <Text style={styles.featureText}>{feature.title}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Premium Plan */}
            <View style={[styles.planCard, styles.premiumPlanCard]}>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>BEST VALUE</Text>
              </View>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>Premium</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.currency}>$</Text>
                  <Text style={styles.planPrice}>
                    {selectedPlan === 'monthly' ? '4.99' : '47.99'}
                  </Text>
                  <Text style={styles.planPeriod}>
                    /{selectedPlan === 'monthly' ? 'month' : 'year'}
                  </Text>
                </View>
                {selectedPlan === 'yearly' && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>Save 20%</Text>
                  </View>
                )}
              </View>

              <View style={styles.planSelector}>
                <TouchableOpacity
                  style={[
                    styles.planButton,
                    selectedPlan === 'monthly' && styles.planButtonActive,
                  ]}
                  onPress={() => setSelectedPlan('monthly')}>
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
                  onPress={() => setSelectedPlan('yearly')}>
                  <Text
                    style={[
                      styles.planButtonText,
                      selectedPlan === 'yearly' && styles.planButtonTextActive,
                    ]}>
                    Yearly
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.featuresList}>
                {PREMIUM_FEATURES.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Image
                      source={icons.add}
                      style={styles.checkIcon}
                      tintColor={colors.teal}
                    />
                    <Text style={styles.featureText}>{feature.title}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => {
                  setShowComparison(false);
                  handleUpgrade();
                }}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image
              source={icons.premium}
              style={styles.premiumIcon}
              tintColor={colors.gold}
              resizeMode="contain"
            />
            <Text style={styles.title}>Unlock Premium</Text>
            <Text style={styles.subtitle}>
              Enhance your self-discovery journey with powerful features
            </Text>
          </View>
        </View>

        {/* Subscription Status */}
        {isPremium && (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Premium Active</Text>
            <Text style={styles.statusDescription}>
              Enjoy all premium features and benefits
            </Text>
            <TouchableOpacity
              style={styles.exportButton}
              onPress={handleExportData}>
              <Text style={styles.exportButtonText}>Export My Data</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Premium Features</Text>
            <TouchableOpacity
              style={styles.compareButton}
              onPress={() => setShowComparison(true)}>
              <Text style={styles.compareButtonText}>Compare Plans</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.featuresContainer}>
            {PREMIUM_FEATURES.map(renderFeatureCard)}
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Terms */}
        <Text style={styles.terms}>
          By upgrading, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>

      {/* Comparison Modal */}
      {renderComparisonModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? hp(8) : hp(6),
  },
  header: {
    backgroundColor: colors.teal,
    paddingTop: Platform.OS === 'ios' ? hp(6) : hp(4),
    paddingBottom: hp(6),
    borderBottomLeftRadius: wp(8),
    borderBottomRightRadius: wp(8),
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: wp(6),
  },
  premiumIcon: {
    width: wp(20),
    height: wp(20),
    marginBottom: hp(2),
  },
  title: {
    fontSize: fontSize(32),
    fontFamily: fonts.black,
    color: colors.white,
    marginBottom: hp(1),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize(18),
    fontFamily: fonts.regular,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: hp(3),
  },
  featuresSection: {
    paddingHorizontal: wp(6),
    marginTop: hp(4),
  },
  sectionTitle: {
    fontSize: fontSize(24),
    fontFamily: fonts.bold,
    color: colors.navy,
    marginBottom: hp(2),
  },
  featuresContainer: {
    gap: hp(2),
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: wp(4),
    borderRadius: wp(4),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconWrapper: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(4),
  },
  featureIcon: {
    width: wp(6),
    height: wp(6),
  },
  featureContent: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  featureTitle: {
    fontSize: fontSize(18),
    fontFamily: fonts.bold,
    color: colors.navy,
  },
  featureDescription: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.navy,
    opacity: 0.7,
    lineHeight: hp(2.5),
  },
  pricingSection: {
    paddingHorizontal: wp(6),
    marginTop: hp(4),
  },
  pricingCard: {
    backgroundColor: colors.white,
    borderRadius: wp(4),
    padding: wp(4),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  planSelector: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    borderRadius: wp(2),
    padding: wp(1),
    marginBottom: hp(3),
  },
  planButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(3),
    borderRadius: wp(1.5),
    alignItems: 'center',
  },
  planButtonActive: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  planButtonText: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.navy,
  },
  planButtonTextActive: {
    fontFamily: fonts.bold,
  },
  savingsBadge: {
    backgroundColor: colors.teal,
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    marginTop: hp(1),
  } as ViewStyle,
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: hp(1),
  },
  currency: {
    fontSize: fontSize(24),
    fontFamily: fonts.bold,
    color: colors.navy,
    marginRight: wp(1),
  },
  price: {
    fontSize: fontSize(48),
    fontFamily: fonts.black,
    color: colors.navy,
  },
  period: {
    fontSize: fontSize(18),
    fontFamily: fonts.regular,
    color: colors.navy,
    opacity: 0.7,
    marginLeft: wp(1),
  },
  savingsContainer: {
    backgroundColor: colors.teal,
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    alignSelf: 'center',
    marginTop: hp(2),
  },
  savingsText: {
    color: colors.white,
    fontSize: fontSize(14),
    fontFamily: fonts.bold,
  },
  upgradeButton: {
    marginHorizontal: wp(6),
    marginTop: hp(6),
    padding: wp(4),
    backgroundColor: colors.teal,
    borderRadius: wp(3),
    alignItems: 'center',
    shadowColor: colors.teal,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  upgradeButtonText: {
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
    color: colors.white,
  },
  terms: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.navy,
    opacity: 0.5,
    textAlign: 'center',
    marginHorizontal: wp(6),
    marginTop: hp(3),
  },
  statusCard: {
    margin: wp(6),
    padding: wp(4),
    backgroundColor: colors.lightGray,
    borderRadius: wp(4),
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
    color: colors.teal,
    marginBottom: hp(1),
  },
  statusDescription: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.navy,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: hp(2),
  },
  exportButton: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    backgroundColor: colors.teal,
    borderRadius: wp(2),
  },
  exportButtonText: {
    fontSize: fontSize(14),
    fontFamily: fonts.bold,
    color: colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  compareButton: {
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(3),
    backgroundColor: colors.lightGray,
    borderRadius: wp(2),
  },
  compareButtonText: {
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    color: colors.teal,
  },
  comparisonModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    zIndex: 1000,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp(6),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  comparisonTitle: {
    fontSize: fontSize(24),
    fontFamily: fonts.bold,
    color: colors.navy,
  },
  closeButton: {
    padding: wp(2),
  },
  closeButtonText: {
    fontSize: fontSize(32),
    fontFamily: fonts.regular,
    color: colors.navy,
  },
  comparisonContent: {
    flex: 1,
  },
  comparisonSection: {
    padding: wp(6),
  },
  comparisonSectionTitle: {
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
    color: colors.navy,
    marginBottom: hp(2),
  },
  premiumBadge: {
    position: 'absolute',
    top: -hp(2),
    right: wp(6),
    backgroundColor: colors.teal,
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    zIndex: 1,
  } as ViewStyle,
  premiumBadgeText: {
    fontSize: fontSize(12),
    fontFamily: fonts.bold,
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: wp(8),
    borderTopRightRadius: wp(8),
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
  modalScroll: {
    padding: wp(6),
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: wp(4),
    padding: wp(6),
    marginBottom: hp(4),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  premiumPlanCard: {
    borderWidth: 2,
    borderColor: colors.teal,
    position: 'relative',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: hp(3),
  },
  planName: {
    fontSize: fontSize(24),
    fontFamily: fonts.bold,
    color: colors.navy,
    marginBottom: hp(1),
  },
  planPrice: {
    fontSize: fontSize(48),
    fontFamily: fonts.black,
    color: colors.navy,
  },
  planPeriod: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.navy,
    opacity: 0.7,
  },
  featuresList: {
    marginTop: hp(2),
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  checkIcon: {
    width: wp(5),
    height: wp(5),
    marginRight: wp(3),
  },
  featureText: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.navy,
    flex: 1,
  },
  errorContainer: {
    margin: wp(6),
    padding: wp(4),
    backgroundColor: colors.lightRed,
    borderRadius: wp(2),
  },
  errorText: {
    color: colors.white,
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
});

export default PremiumScreen;
