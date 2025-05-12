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

const DailyPromptScreen = () => {
  const dispatch = useDispatch();
  const [response, setResponse] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  const currentPrompt = useSelector(
    (state: RootState) => state.prompt.currentPrompt,
  );

  useEffect(() => {
    loadPrompt();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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
      <Animated.View style={[styles.promptCard, {opacity: fadeAnim}]}>
        <Text style={styles.promptText}>{currentPrompt}</Text>
      </Animated.View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Write your thoughts here..."
          value={response}
          onChangeText={setResponse}
          textAlignVertical="top"
          placeholderTextColor={colors.navy}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Image
            source={icons.add}
            style={{height: wp(6.4), width: wp(6.4)}}
            tintColor={colors.teal}
            resizeMode="contain"
          />
          <Text style={styles.skipButtonText}>New Prompt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveButton,
            !response.trim() && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!response.trim()}>
          <Text style={styles.saveButtonText}>Save & Reflect</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'red',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: hp(3.07),
  },
  promptCard: {
    backgroundColor: colors.teal,
    padding: hp(2.46),
    borderRadius: hp(1.47),
    marginBottom: hp(2.46),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promptText: {
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
    color: colors.beige,
  },
  inputContainer: {
    flex: 1,
    marginBottom: hp(2.46),
  },
  input: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: wp(2.13),
    padding: hp(1.84),
    fontSize: fontSize(18),
    color: colors.navy,
    textAlignVertical: 'top',
    minHeight: hp(24.63),
    fontFamily: fonts.regular,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp(1.47),
  },
  skipButtonText: {
    marginLeft: wp(2.13),
    color: colors.navy,
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
  },
  saveButton: {
    backgroundColor: colors.teal,
    paddingHorizontal: wp(6.4),
    paddingVertical: hp(1.47),
    borderRadius: wp(2.13),
  },
  saveButtonDisabled: {
    backgroundColor: colors.teal,
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.beige,
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
  },
});

export default DailyPromptScreen;
