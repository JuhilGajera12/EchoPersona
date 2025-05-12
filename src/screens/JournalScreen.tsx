import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {colors} from '../constant/colors';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {fonts} from '../constant/fonts';
import {icons} from '../constant/icons';
import {RootState} from '../store';
import {deleteEntry} from '../store/slices/journalSlice';

interface JournalEntry {
  prompt: string;
  response: string;
  timestamp: string;
}

const JournalScreen = () => {
  const dispatch = useDispatch();
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const entries = useSelector((state: RootState) => state.journal.entries);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDeleteEntry = (timestamp: string) => {
    dispatch(deleteEntry(timestamp));
    setIsModalVisible(false);
  };

  const filteredEntries = entries.filter(entry => {
    const searchLower = searchQuery.toLowerCase();
    return (
      entry.prompt.toLowerCase().includes(searchLower) ||
      entry.response.toLowerCase().includes(searchLower)
    );
  });

  const renderEntry = ({item}: {item: JournalEntry}) => (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => {
        setSelectedEntry(item);
        setIsModalVisible(true);
      }}>
      <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
      <Text style={styles.promptText} numberOfLines={2}>
        {item.prompt}
      </Text>
      <Text style={styles.responseText} numberOfLines={2}>
        {item.response}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Image
          source={icons.search}
          style={styles.searchIcon}
          resizeMode="contain"
          tintColor={colors.teal}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search entries..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.navy}
        />
      </View>

      <FlatList
        data={filteredEntries}
        renderItem={renderEntry}
        keyExtractor={item => item.timestamp}
        contentContainerStyle={styles.listContainer}
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
                <Text style={styles.modalDate}>
                  {formatDate(selectedEntry.timestamp)}
                </Text>
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
                  />
                  <Text style={styles.deleteButtonText}>Delete Entry</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: hp(3.07),
    borderRadius: wp(3.2),
    height: hp(6.15),
    color: colors.navy,
    fontFamily: fonts.regular,
    justifyContent: 'center',
    backgroundColor: colors.darkGray,
  },
  searchIcon: {
    marginHorizontal: wp(2.13),
    height: hp(3.69),
    width: hp(3.69),
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize(20),
    color: colors.navy,
    fontFamily: fonts.regular,
  },
  listContainer: {
    marginHorizontal: hp(3.07),
  },
  entryCard: {
    backgroundColor: colors.teal,
    padding: wp(4.26),
    borderRadius: wp(3.2),
    marginBottom: wp(3.2),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateText: {
    fontSize: fontSize(18),
    color: colors.lightGray,
    marginBottom: wp(2.13),
    fontFamily: fonts.regular,
  },
  promptText: {
    fontSize: fontSize(22),
    color: colors.beige,
    marginBottom: wp(2.13),
    fontFamily: fonts.bold,
  },
  responseText: {
    fontSize: fontSize(18),
    color: colors.lightGray,
    fontFamily: fonts.regular,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: wp(5.33),
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: wp(3.2),
    padding: wp(5.33),
    maxHeight: '80%',
  },
  modalDate: {
    fontSize: fontSize(16),
    color: colors.navy,
    marginBottom: wp(3.2),
    fontFamily: fonts.regular,
  },
  modalPrompt: {
    fontSize: fontSize(22),
    color: colors.teal,
    fontFamily: fonts.bold,
    marginBottom: wp(4.26),
  },
  modalResponse: {
    fontSize: fontSize(20),
    color: colors.navy,
    marginBottom: wp(6.4),
  },
  deleteIcon: {
    height: wp(6.4),
    width: wp(6.4),
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(3.2),
    backgroundColor: '#FFF5F5',
    borderRadius: wp(2.13),
    marginBottom: wp(3.2),
  },
  deleteButtonText: {
    color: colors.lightRed,
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
    marginLeft: wp(2.13),
  },
  closeButton: {
    padding: wp(3.2),
    backgroundColor: colors.darkGray,
    borderRadius: wp(2.13),
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.teal,
    fontSize: fontSize(20),
    fontFamily: fonts.bold,
  },
});

export default JournalScreen;
