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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {fonts} from '../constant/fonts';
import {colors} from '../constant/colors';
import {icons} from '../constant/icons';

const SAMPLE_PROMPTS = [
  'What does growth mean to you today?',
  'How do you feel about your current path in life?',
  'What would you tell your younger self?',
  'What brings you joy in unexpected moments?',
  'How do you define success for yourself?',
];

const DailyPromptScreen = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadPrompt();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadPrompt = async () => {
    try {
      const savedPrompt = await AsyncStorage.getItem('currentPrompt');
      if (savedPrompt) {
        setPrompt(savedPrompt);
      } else {
        const randomPrompt =
          SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
        setPrompt(randomPrompt);
        await AsyncStorage.setItem('currentPrompt', randomPrompt);
      }
    } catch (error) {
      console.error('Error loading prompt:', error);
    }
  };

  const handleSave = async () => {
    if (!response.trim()) return;

    try {
      const entry = {
        prompt,
        response,
        timestamp: new Date().toISOString(),
      };

      const existingEntries = await AsyncStorage.getItem('journalEntries');
      const entries = existingEntries ? JSON.parse(existingEntries) : [];
      entries.unshift(entry);
      await AsyncStorage.setItem('journalEntries', JSON.stringify(entries));

      // Clear response and get new prompt
      setResponse('');
      const randomPrompt =
        SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
      setPrompt(randomPrompt);
      await AsyncStorage.setItem('currentPrompt', randomPrompt);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleSkip = async () => {
    const randomPrompt =
      SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    setPrompt(randomPrompt);
    await AsyncStorage.setItem('currentPrompt', randomPrompt);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <Animated.View style={[styles.promptCard, {opacity: fadeAnim}]}>
        <Text style={styles.promptText}>{prompt}</Text>
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
