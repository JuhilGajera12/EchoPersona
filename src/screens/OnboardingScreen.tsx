import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {useColors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {icons} from '../constant/icons';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {completeOnboarding} from '../store/slices/onboardingSlice';

const {width, height} = Dimensions.get('window');

interface SlideItem {
  id: string;
  title: string;
  description: string;
  image: number;
}

const slides: SlideItem[] = [
  {
    id: '1',
    title: 'Welcome to Echo Persona',
    description:
      'Your AI-powered platform for personal growth and self-reflection',
    image: icons.evolution,
  },
  {
    id: '2',
    title: 'Daily Prompts',
    description:
      'Start your journey with daily reflection prompts that spark meaningful insights',
    image: icons.pencil,
  },
  {
    id: '3',
    title: 'Journal Your Thoughts',
    description:
      'Document your thoughts, feelings, and experiences in your personal journal',
    image: icons.journal,
  },
  {
    id: '4',
    title: 'Track Your Evolution',
    description: 'Watch your growth over time and see how your persona evolves',
    image: icons.compare,
  },
];

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const dispatch = useDispatch();
  const colors = useColors();
  const styles = createStyles(colors);

  const renderSlideItem = ({item}: {item: SlideItem}) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.image}
            resizeMode="contain"
            tintColor={colors.gold}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = () => {
    dispatch(completeOnboarding());
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const Pagination = () => {
    return (
      <View style={styles.paginationContainer}>
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentIndex ? colors.gold : colors.lightGray,
                },
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlideItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        keyExtractor={item => item.id}
      />
      <Pagination />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}>
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.white,
    },
    slide: {
      width,
      height: height * 0.8,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: wp(8),
    },
    imageContainer: {
      width: wp(50),
      height: wp(50),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.lightGray,
      borderRadius: wp(25),
      marginBottom: hp(5),
    },
    image: {
      width: wp(30),
      height: wp(30),
    },
    textContainer: {
      alignItems: 'center',
    },
    title: {
      fontSize: fontSize(28),
      fontFamily: fonts.black,
      color: colors.black,
      textAlign: 'center',
      marginBottom: hp(2),
    },
    description: {
      fontSize: fontSize(16),
      fontFamily: fonts.regular,
      color: colors.black,
      textAlign: 'center',
      lineHeight: hp(3),
    },
    paginationContainer: {
      height: hp(5),
      justifyContent: 'center',
      alignItems: 'center',
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dot: {
      width: wp(2.5),
      height: wp(2.5),
      borderRadius: wp(1.25),
      marginHorizontal: wp(1),
    },
    buttonContainer: {
      paddingHorizontal: wp(8),
      paddingBottom: hp(5),
      alignItems: 'center',
    },
    button: {
      backgroundColor: colors.gold,
      paddingVertical: hp(2),
      paddingHorizontal: wp(10),
      borderRadius: wp(8),
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    buttonText: {
      color: colors.white,
      fontSize: fontSize(18),
      fontFamily: fonts.bold,
    },
    skipContainer: {
      position: 'absolute',
      top: hp(2),
      right: wp(5),
      zIndex: 1,
    },
    skipButton: {
      padding: wp(2),
    },
    skipText: {
      color: colors.black,
      fontSize: fontSize(16),
      fontFamily: fonts.bold,
    },
  });

export default OnboardingScreen;
