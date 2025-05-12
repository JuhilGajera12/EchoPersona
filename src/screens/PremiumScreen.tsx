import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {icons} from '../constant/icons';
import {colors} from '../constant/colors';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {fonts} from '../constant/fonts';

interface PremiumFeature {
  icon: string;
  title: string;
  description: string;
}

const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    icon: icons.chart,
    title: 'Weekly Persona Profiles',
    description:
      'Get detailed insights about your personality evolution every week',
  },
  {
    icon: icons.compare,
    title: 'Comparison Insights',
    description: 'Compare your current self with past versions to track growth',
  },
  {
    icon: icons.voice,
    title: 'Voice Journaling',
    description: 'Record your thoughts and get them transcribed automatically',
  },
  {
    icon: icons.email,
    title: 'Future Self Letters',
    description: 'Receive AI-generated letters from your future self',
  },
];

const PremiumScreen = () => {
  const [isPremium, setIsPremium] = useState(false);

  const handleUpgrade = async () => {
    // In a real app, this would integrate with Stripe or another payment processor
    try {
      // Simulate successful purchase
      await AsyncStorage.setItem('isPremium', 'true');
      setIsPremium(true);
    } catch (error) {
      console.error('Error upgrading to premium:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={icons.premium}
          resizeMode="contain"
          style={styles.premiumIcon}
          tintColor={colors.gold}
        />
        <Text style={styles.title}>Upgrade to Premium</Text>
        <Text style={styles.subtitle}>
          Unlock powerful features to enhance your self-discovery journey
        </Text>
      </View>

      <View style={styles.featuresContainer}>
        {PREMIUM_FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <Image
              source={feature.icon}
              resizeMode="contain"
              style={styles.featureIcons}
            />
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>
                {feature.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.pricingContainer}>
        <Text style={styles.pricingTitle}>Choose Your Plan</Text>
        <View style={styles.pricingCard}>
          <Text style={styles.price}>$4.99</Text>
          <Text style={styles.period}>per month</Text>
          <Text style={styles.pricingDescription}>
            Cancel anytime. All premium features included.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.upgradeButton,
          isPremium && styles.upgradeButtonDisabled,
        ]}
        onPress={handleUpgrade}
        disabled={isPremium}>
        <Text style={styles.upgradeButtonText}>
          {isPremium ? 'Premium Active' : 'Upgrade Now'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.terms}>
        By upgrading, you agree to our Terms of Service and Privacy Policy
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  premiumIcon: {
    height: hp(7.38),
    width: hp(7.38),
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    alignItems: 'center',
    padding: hp(3.94),
    backgroundColor: colors.teal,
  },
  title: {
    fontSize: fontSize(32),
    color: colors.beige,
    marginTop: hp(1.97),
    marginBottom: hp(0.98),
    fontFamily: fonts.black,
  },
  subtitle: {
    fontSize: fontSize(20),
    color: colors.beige,
    textAlign: 'center',
    lineHeight: fontSize(28),
  },
  featuresContainer: {
    padding: wp(5.33),
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkGray,
    padding: wp(4.26),
    borderRadius: wp(3.2),
    marginBottom: wp(3.2),
  },
  featureText: {
    marginLeft: wp(4.26),
    flex: 1,
  },
  featureIcons: {
    height: hp(6.4),
    width: hp(6.4),
  },
  featureTitle: {
    fontSize: fontSize(22),
    fontFamily: fonts.bold,
    color: colors.navy,
    marginBottom: wp(1.066),
  },
  featureDescription: {
    fontSize: fontSize(17),
    color: '#666',
    lineHeight: wp(5.33),
  },
  pricingContainer: {
    padding: wp(5.33),
  },
  pricingTitle: {
    fontSize: fontSize(24),
    fontFamily: fonts.bold,
    color: colors.navy,
    marginBottom: wp(4.26),
    textAlign: 'center',
  },
  pricingCard: {
    backgroundColor: colors.teal,
    padding: wp(6.4),
    borderRadius: wp(3.2),
    alignItems: 'center',
  },
  price: {
    fontSize: fontSize(42),
    fontFamily: fonts.black,
    color: colors.gold,
  },
  period: {
    fontSize: fontSize(20),
    color: colors.beige,
    marginTop: wp(1.066),
    fontFamily: fonts.regular,
  },
  pricingDescription: {
    fontSize: fontSize(18),
    color: colors.beige,
    textAlign: 'center',
    fontFamily: fonts.regular,
    marginTop: wp(4.26),
  },
  upgradeButton: {
    backgroundColor: colors.gold,
    margin: wp(5.33),
    padding: wp(4.26),
    borderRadius: wp(3.2),
    alignItems: 'center',
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    color: colors.white,
    fontSize: fontSize(24),
    fontFamily: fonts.bold,
  },
  terms: {
    fontSize: fontSize(16),
    color: colors.navy,
    textAlign: 'center',
    marginBottom: wp(8.53),
    paddingHorizontal: wp(5.33),
    fontFamily: fonts.regular,
  },
});

export default PremiumScreen;
