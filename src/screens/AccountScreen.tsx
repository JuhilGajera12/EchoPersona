import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout, deleteAccount } from '../store/slices/authSlice';
import { colors } from '../constants/colors';

const AccountScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await dispatch(logout());
            navigation.navigate('Login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteAccount()).unwrap();
              navigation.navigate('Login');
              Alert.alert('Success', 'Account deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Account Settings</Text>
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Text style={styles.optionText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, styles.deleteOption]}
          onPress={handleDeleteAccount}
        >
          <Text style={[styles.optionText, styles.deleteText]}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.black,
  },
  userInfo: {
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  userEmail: {
    fontSize: 18,
    color: colors.black,
    fontWeight: '600',
  },
  userName: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 4,
  },
  optionsContainer: {
    gap: 16,
  },
  option: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  deleteOption: {
    borderColor: colors.error,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  deleteText: {
    color: colors.error,
  },
});

export default AccountScreen; 