import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            // In a real app, you would also handle auth state here
          } catch (error) {
            console.error('Error logging out:', error);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              // In a real app, you would also handle account deletion with your backend
            } catch (error) {
              console.error('Error deleting account:', error);
            }
          },
        },
      ],
    );
  };

  const handleExportData = async () => {
    try {
      const journalEntries = await AsyncStorage.getItem('journalEntries');
      const profiles = await AsyncStorage.getItem('historicalProfiles');
      const currentProfile = await AsyncStorage.getItem('currentProfile');

      const exportData = {
        journalEntries: journalEntries ? JSON.parse(journalEntries) : [],
        profiles: profiles ? JSON.parse(profiles) : [],
        currentProfile: currentProfile ? JSON.parse(currentProfile) : null,
      };

      // In a real app, you would handle the actual export here
      console.log('Export data:', exportData);
      Alert.alert('Success', 'Your data has been exported successfully.');
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            {/* <Icon name="theme-light-dark" size={24} color="#4A90E2" /> */}
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{false: '#E5E5E5', true: '#4A90E2'}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
          <View style={styles.settingInfo}>
            {/* <Icon name="download" size={24} color="#4A90E2" /> */}
            <Text style={styles.settingText}>Export Data</Text>
          </View>
          {/* <Icon name="chevron-right" size={24} color="#999" /> */}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={handleDeleteAccount}>
          <View style={styles.settingInfo}>
            {/* <Icon name="delete" size={24} color="#FF3B30" /> */}
            <Text style={[styles.settingText, styles.dangerText]}>
              Delete Account
            </Text>
          </View>
          {/* <Icon name="chevron-right" size={24} color="#999" /> */}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            {/* <Icon name="star" size={24} color="#FFD700" /> */}
            <Text style={styles.settingText}>Premium Status</Text>
          </View>
          <Text style={styles.premiumStatus}>
            {isPremium ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        {/* <Icon name="logout" size={24} color="#FF3B30" /> */}
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  dangerText: {
    color: '#FF3B30',
  },
  premiumStatus: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  version: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    marginBottom: 32,
  },
});

export default SettingsScreen;
