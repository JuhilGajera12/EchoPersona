import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {fonts} from '../constant/fonts';
import {colors} from '../constant/colors';
import {icons} from '../constant/icons';
import {RootState} from '../store';
import {setCurrentPrompt} from '../store/slices/promptSlice';
import {addEntry} from '../store/slices/journalSlice';

const SAMPLE_PROMPTS = [
  'What does growth mean to you today?',
  'How do you feel about your current path in life?',
  'What would you tell your younger self?',
  'What brings you joy in unexpected moments?',
  'How do you define success for yourself?',
];

const {width} = Dimensions.get('window');
const CARD_WIDTH = width - wp(10);

const DailyPromptScreen = () => {
  const dispatch = useDispatch();
  const [response, setResponse] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const currentPrompt = useSelector(
    (state: RootState) => state.prompt.currentPrompt,
  );

  useEffect(() => {
    loadPrompt();
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
  }, [fadeAnim, slideAnim]);

  const loadPrompt = () => {
    if (!currentPrompt) {
      const randomPrompt =
        SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
      dispatch(setCurrentPrompt(randomPrompt));
    }
  };

  const handleSave = () => {
    if (!response.trim() || !currentPrompt) return;

    const entry = {
      prompt: currentPrompt,
      response,
      timestamp: new Date().toISOString(),
    };

    dispatch(addEntry(entry));

    setResponse('');
    const randomPrompt =
      SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    dispatch(setCurrentPrompt(randomPrompt));
  };

  const handleSkip = () => {
    const randomPrompt =
      SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    dispatch(setCurrentPrompt(randomPrompt));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Reflection</Text>
        <Text style={styles.headerSubtitle}>Take a moment to reflect on your journey</Text>
      </View>

      <Animated.View 
        style={[
          styles.promptCard,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <View style={styles.promptContent}>
          <View style={styles.promptIconContainer}>
            <Image
              source={icons.journal}
              style={styles.promptIcon}
              tintColor={colors.white}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.promptText}>{currentPrompt}</Text>
        </View>
      </Animated.View>

      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Share your thoughts..."
            value={response}
            onChangeText={setResponse}
            textAlignVertical="top"
            placeholderTextColor={colors.sand}
            selectionColor={colors.gold}
          />
          <View style={styles.inputFocusIndicator} />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={handleSkip}
          activeOpacity={0.8}>
          <Image
            source={icons.add}
            style={styles.skipIcon}
            tintColor={colors.gold}
            resizeMode="contain"
          />
          <Text style={styles.skipButtonText}>Try Another</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveButton,
            !response.trim() && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!response.trim()}
          activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Save Reflection</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? hp(6) : StatusBar.currentHeight + hp(2),
    paddingBottom: hp(2),
    paddingHorizontal: wp(5),
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: fontSize(32),
    fontFamily: fonts.black,
    color: colors.black,
    marginBottom: hp(0.5),
  },
  headerSubtitle: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.sand,
    opacity: 0.8,
  },
  promptCard: {
    width: CARD_WIDTH,
    alignSelf: 'center',
    backgroundColor: colors.gold,
    borderRadius: wp(4),
    marginBottom: hp(4),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  promptContent: {
    padding: wp(6),
  },
  promptIconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  promptIcon: {
    width: wp(6),
    height: wp(6),
  },
  promptText: {
    fontSize: fontSize(24),
    fontFamily: fonts.bold,
    color: colors.black,
    lineHeight: hp(3.5),
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: wp(5),
    marginBottom: hp(3),
  },
  inputContainer: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: wp(4),
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    padding: wp(5),
    fontSize: fontSize(18),
    color: colors.black,
    fontFamily: fonts.regular,
    lineHeight: hp(2.8),
  },
  inputFocusIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.gold,
    opacity: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: wp(5),
    marginBottom: hp(4),
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    backgroundColor: colors.lightGray,
    borderRadius: wp(3),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  skipIcon: {
    width: wp(5),
    height: wp(5),
  },
  skipButtonText: {
    marginLeft: wp(2),
    color: colors.black,
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
  },
  saveButton: {
    backgroundColor: colors.black,
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(6),
    borderRadius: wp(3),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },
});

export default DailyPromptScreen;
