import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {wp} from '../helpers/globalFunction';

interface HistoricalProfile {
  summary: string;
  traits: string[];
  timestamp: string;
}

const {width} = Dimensions.get('window');
const TIMELINE_ITEM_WIDTH = width * 0.8;

const EvolutionScreen = () => {
  const [profiles, setProfiles] = useState<HistoricalProfile[]>([]);
  const [selectedProfile, setSelectedProfile] =
    useState<HistoricalProfile | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadProfiles();
    checkPremiumStatus();
  }, []);

  const loadProfiles = async () => {
    try {
      const savedProfiles = await AsyncStorage.getItem('historicalProfiles');
      if (savedProfiles) {
        const parsedProfiles = JSON.parse(savedProfiles);
        setProfiles(parsedProfiles);
        if (parsedProfiles.length > 0) {
          setSelectedProfile(parsedProfiles[0]);
        }
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const premiumStatus = await AsyncStorage.getItem('isPremium');
      setIsPremium(premiumStatus === 'true');
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const handleCompare = () => {
    if (!isPremium) {
      // Navigate to premium screen or show upgrade modal
      return;
    }
    // Implement comparison logic here
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.timelineContainer}>
        {profiles.map((profile, index) => (
          <TouchableOpacity
            key={profile.timestamp}
            style={styles.timelineItem}
            onPress={() => setSelectedProfile(profile)}>
            <View style={styles.timelineNode}>
              <View style={styles.timelineDot} />
              {index < profiles.length - 1 && (
                <View style={styles.timelineLine} />
              )}
            </View>
            <Text style={styles.timelineDate}>
              {formatDate(profile.timestamp)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedProfile ? (
        <ScrollView style={styles.profileContainer}>
          <View style={styles.profileCard}>
            <Text style={styles.profileDate}>
              {formatDate(selectedProfile.timestamp)}
            </Text>
            <Text style={styles.profileSummary}>{selectedProfile.summary}</Text>
            <View style={styles.traitsContainer}>
              {selectedProfile.traits.map((trait, index) => (
                <View key={index} style={styles.traitBadge}>
                  <Text style={styles.traitText}>{trait}</Text>
                </View>
              ))}
            </View>
          </View>

          {isPremium && profiles.length > 1 && (
            <TouchableOpacity
              style={styles.compareButton}
              onPress={handleCompare}>
              {/* <Icon name="compare" size={24} color="#4A90E2" /> */}
              <Text style={styles.compareButtonText}>Compare with Today</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          {/* <Icon name="timeline-clock" size={48} color="#999" /> */}
          <Text style={styles.emptyStateText}>
            Your evolution timeline will appear here as you continue journaling
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  timelineContainer: {
    height: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  timelineItem: {
    width: TIMELINE_ITEM_WIDTH,
    alignItems: 'center',
    paddingTop: 20,
    backgroundColor: 'red',
  },
  timelineNode: {
    alignItems: 'center',
    backgroundColor: 'yellow',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4A90E2',
  },
  timelineLine: {
    position: 'absolute',
    top: 6,
    width: TIMELINE_ITEM_WIDTH,
    height: 2,
    backgroundColor: '#E5E5E5',
  },
  timelineDate: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  profileContainer: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  profileSummary: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  traitBadge: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  traitText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(4.26),
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: wp(10),
  },
  compareButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default EvolutionScreen;
