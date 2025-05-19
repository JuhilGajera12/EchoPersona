import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {fonts} from '../constant/fonts';
import {useColors, Colors} from '../constant/colors';
import {icons} from '../constant/icons';
import {RootState} from '../store';
import {setCurrentPrompt} from '../store/slices/promptSlice';
import {addEntry} from '../store/slices/journalSlice';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {PERMISSIONS, request, RESULTS} from 'react-native-permissions';
import {StreakBadge} from '../components/common/StreakBadge';
import {calculateStreaks} from '../utils/streakUtils';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

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
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const isListner = useRef<any | null>(null);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const streakAnim = useSharedValue(0);
  const promptScale = useSharedValue(1);
  const colors = useColors();
  const styles = createStyles(colors);

  const currentPrompt = useSelector(
    (state: RootState) => state.prompt.currentPrompt,
  );
  const journalEntries = useSelector(
    (state: RootState) => state.journal.entries,
  );

  const {currentStreak, bestStreak} = calculateStreaks(journalEntries);

  useEffect(() => {
    loadPrompt();
    fadeAnim.value = withTiming(1, {duration: 800});
    slideAnim.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });
    streakAnim.value = withTiming(1, {duration: 1000});
  }, []);

  const promptCardStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{translateY: slideAnim.value}, {scale: promptScale.value}],
    };
  });

  const loadPrompt = () => {
    if (!currentPrompt) {
      const randomPrompt =
        SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
      dispatch(setCurrentPrompt(randomPrompt));
    }
  };

  const handleSave = () => {
    if (!response.trim() || !currentPrompt) {
      return;
    }

    const entry = {
      prompt: currentPrompt,
      response,
      timestamp: new Date().toISOString(),
      recordingUri: recordingUri || undefined,
      recordingDuration: recordingDuration || undefined,
    };

    dispatch(addEntry(entry));

    streakAnim.value = 0;
    streakAnim.value = withSpring(1, {
      damping: 8,
      stiffness: 100,
    });

    promptScale.value = withSpring(
      1.05,
      {
        damping: 8,
        stiffness: 100,
      },
      () => {
        promptScale.value = withSpring(1, {
          damping: 15,
          stiffness: 100,
        });
      },
    );

    setResponse('');
    setRecordingUri(null);
    setRecordingDuration(0);
    const randomPrompt =
      SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    dispatch(setCurrentPrompt(randomPrompt));
  };

  const handleVoiceRecord = async () => {
    try {
      const micStatus = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
      if (micStatus !== RESULTS.GRANTED) {
        return;
      }

      if (!isRecording) {
        const result = await audioRecorderPlayer.startRecorder();
        setIsRecording(true);
        setRecordingUri(result);
        setRecordingDuration(0);
        isListner.current = audioRecorderPlayer.addRecordBackListener(e => {
          setRecordingDuration(e.currentPosition);
        });
      } else {
        await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
        isListner.current = null;
        setIsRecording(false);
      }
    } catch (err) {
      setIsRecording(false);
      setRecordingUri(null);
      setRecordingDuration(0);
      if (isListner.current) {
        audioRecorderPlayer.removeRecordBackListener();
        isListner.current = null;
      }
    }
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
        <Text style={styles.headerSubtitle}>
          Take a moment to reflect on your journey
        </Text>
      </View>

      <Animated.View style={[styles.promptCard, promptCardStyle]}>
        <View style={styles.promptContent}>
          <View style={styles.promptHeader}>
            <View style={styles.promptIconContainer}>
              <Image
                source={icons.journal}
                style={styles.promptIcon}
                tintColor={colors.white}
                resizeMode="contain"
              />
            </View>
            <StreakBadge
              currentStreak={currentStreak}
              bestStreak={bestStreak}
              animatedValue={streakAnim}
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
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.recordVoiceButton,
            isRecording && styles.recordingActiveButton,
          ]}
          onPress={handleVoiceRecord}
          activeOpacity={0.8}>
          <Image
            source={icons.voice}
            style={styles.skipIcon}
            tintColor={colors.white}
            resizeMode="contain"
          />
          <Text style={styles.saveButtonText}>
            {isRecording ? 'Stop Recording' : 'Record Voice'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveButton,
            !response.trim() && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!response.trim()}
          activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.white,
    },
    header: {
      paddingTop:
        Platform.OS === 'ios' ? hp(6) : (StatusBar.currentHeight ?? 0) + hp(2),
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
    promptHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hp(2),
    },
    promptIconContainer: {
      width: wp(12),
      height: wp(12),
      borderRadius: wp(6),
      backgroundColor: colors.black,
      justifyContent: 'center',
      alignItems: 'center',
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
      paddingVertical: hp(1.8),
      paddingHorizontal: wp(5),
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
      justifyContent: 'center',
    },
    skipIcon: {
      width: wp(5),
      height: wp(5),
      marginRight: wp(2),
    },
    skipButtonText: {
      color: colors.black,
      fontSize: fontSize(16),
      fontFamily: fonts.bold,
    },
    recordVoiceButton: {
      backgroundColor: colors.gold,
      paddingVertical: hp(1.8),
      paddingHorizontal: wp(5),
      borderRadius: wp(3),
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    recordingActiveButton: {
      backgroundColor: colors.error,
    },
    saveButton: {
      backgroundColor: colors.black,
      paddingVertical: hp(1.8),
      paddingHorizontal: wp(5),
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
