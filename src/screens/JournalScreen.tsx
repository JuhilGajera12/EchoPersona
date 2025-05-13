import React, {useState, useCallback, memo} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Image,
  StatusBar,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {colors} from '../constant/colors';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {fonts} from '../constant/fonts';
import {icons} from '../constant/icons';
import {RootState} from '../store';
import {deleteEntry} from '../store/slices/journalSlice';

const {width} = Dimensions.get('window');
const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

interface JournalEntry {
  prompt: string;
  response: string;
  timestamp: string;
}

const JournalEntryCard = memo(
  ({item, onPress}: {item: JournalEntry; onPress: () => void}) => {
    const formatDate = (timestamp: string) => {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    return (
      <TouchableOpacity
        style={styles.entryCard}
        onPress={onPress}
        activeOpacity={0.8}>
        <View style={styles.entryHeader}>
          <View style={styles.dateContainer}>
            <Image
              source={icons.calendar}
              style={styles.dateIcon}
              tintColor={colors.gold}
              resizeMode="contain"
            />
            <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
          </View>
        </View>
        <Text style={styles.promptText} numberOfLines={2}>
          {item.prompt}
        </Text>
        <Text style={styles.responseText} numberOfLines={3}>
          {item.response}
        </Text>
      </TouchableOpacity>
    );
  },
);

const JournalScreen = () => {
  const dispatch = useDispatch();
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  const entries = useSelector((state: RootState) => state.journal.entries);

  React.useEffect(() => {
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

  const handleDeleteEntry = useCallback(
    (timestamp: string) => {
      dispatch(deleteEntry(timestamp));
      setIsModalVisible(false);
    },
    [dispatch],
  );

  const filteredEntries = entries.filter(entry => {
    const searchLower = searchQuery.toLowerCase();
    return (
      entry.prompt.toLowerCase().includes(searchLower) ||
      entry.response.toLowerCase().includes(searchLower)
    );
  });

  const renderEntry = useCallback(
    ({item}: {item: JournalEntry}) => (
      <JournalEntryCard
        item={item}
        onPress={() => {
          setSelectedEntry(item);
          setIsModalVisible(true);
        }}
      />
    ),
    [],
  );

  const keyExtractor = useCallback((item: JournalEntry) => item.timestamp, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <View style={styles.headerContent}>
          <Image
            source={icons.journal}
            style={styles.headerIcon}
            tintColor={colors.gold}
            resizeMode="contain"
          />
          <Text style={styles.title}>Journal</Text>
          <Text style={styles.subtitle}>Your personal reflections</Text>
        </View>
      </Animated.View>

      <View style={styles.searchContainer}>
        <Image
          source={icons.search}
          style={styles.searchIcon}
          resizeMode="contain"
          tintColor={colors.gold}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search entries..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.sand}
          selectionColor={colors.gold}
        />
      </View>

      <FlatList
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {/* <Image
              source={icons.journal}
              style={styles.emptyStateIcon}
              tintColor={colors.gold}
              resizeMode="contain"
            /> */}
            <Text style={styles.emptyStateTitle}>No Entries Yet</Text>
            <Text style={styles.emptyStateText}>
              Your journal entries will appear here as you reflect on daily
              prompts
            </Text>
          </View>
        }
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedEntry && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalDateContainer}>
                    <Image
                      source={icons.calendar}
                      style={styles.modalDateIcon}
                      tintColor={colors.gold}
                      resizeMode="contain"
                    />
                    <Text style={styles.modalDate}>
                      {new Date(selectedEntry.timestamp).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        },
                      )}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsModalVisible(false)}>
                    <Image
                      source={icons.close}
                      style={styles.closeIcon}
                      tintColor={colors.black}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalPrompt}>{selectedEntry.prompt}</Text>
                <Text style={styles.modalResponse}>
                  {selectedEntry.response}
                </Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteEntry(selectedEntry.timestamp)}>
                  <Image
                    source={icons.delete}
                    resizeMode="contain"
                    style={styles.deleteIcon}
                    tintColor={colors.black}
                  />
                  <Text style={styles.deleteButtonText}>Delete Entry</Text>
                </TouchableOpacity>
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
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'ios' ? hp(6) : STATUS_BAR_HEIGHT + hp(2),
    paddingBottom: hp(2),
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
    color: colors.black,
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.black,
    opacity: 0.7,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: hp(2),
    paddingHorizontal: wp(4),
    height: hp(6),
    backgroundColor: colors.lightGray,
    borderRadius: wp(4),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    width: wp(5),
    height: wp(5),
    marginRight: wp(3),
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize(16),
    color: colors.black,
    fontFamily: fonts.regular,
  },
  listContainer: {
    padding: wp(5),
  },
  entryCard: {
    backgroundColor: colors.white,
    padding: wp(5),
    borderRadius: wp(4),
    marginBottom: hp(2),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    width: wp(4),
    height: wp(4),
    marginRight: wp(2),
  },
  dateText: {
    fontSize: fontSize(14),
    color: colors.sand,
    fontFamily: fonts.regular,
  },
  promptText: {
    fontSize: fontSize(18),
    color: colors.black,
    marginBottom: hp(1.5),
    fontFamily: fonts.bold,
    lineHeight: hp(2.5),
  },
  responseText: {
    fontSize: fontSize(16),
    color: colors.black,
    opacity: 0.8,
    fontFamily: fonts.regular,
    lineHeight: hp(2.3),
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(6),
    marginTop: hp(10),
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
    color: colors.black,
    marginBottom: hp(2),
  },
  emptyStateText: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.black,
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
    padding: wp(6),
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  modalDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalDateIcon: {
    width: wp(4),
    height: wp(4),
    marginRight: wp(2),
  },
  modalDate: {
    fontSize: fontSize(16),
    color: colors.sand,
    fontFamily: fonts.regular,
  },
  closeButton: {
    padding: wp(2),
  },
  closeIcon: {
    width: wp(5),
    height: wp(5),
  },
  modalPrompt: {
    fontSize: fontSize(22),
    color: colors.black,
    fontFamily: fonts.bold,
    marginBottom: hp(3),
    lineHeight: hp(3),
  },
  modalResponse: {
    fontSize: fontSize(18),
    color: colors.black,
    opacity: 0.8,
    fontFamily: fonts.regular,
    marginBottom: hp(4),
    lineHeight: hp(2.8),
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(4),
    backgroundColor: colors.lightGray,
    borderRadius: wp(3),
    marginTop: hp(2),
  },
  deleteIcon: {
    width: wp(5),
    height: wp(5),
    marginRight: wp(2),
  },
  deleteButtonText: {
    color: colors.black,
    fontSize: fontSize(16),
    fontFamily: fonts.bold,
  },
});

export default memo(JournalScreen);
