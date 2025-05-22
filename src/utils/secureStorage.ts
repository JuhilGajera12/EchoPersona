import * as Keychain from 'react-native-keychain';
import { PIN_KEY, BIOMETRIC_ENABLED_KEY } from '../helpers';

export const savePin = async (pin: string): Promise<boolean> => {
  try {
    await Keychain.setGenericPassword(PIN_KEY, pin, {
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
    });
    return true;
  } catch (error) {
    console.error('Failed to save PIN:', error);
    return false;
  }
};

export const getPin = async (): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials && typeof credentials === 'object' && 'password' in credentials) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    console.error('Failed to get PIN:', error);
    return null;
  }
};

export const deletePin = async (): Promise<boolean> => {
  try {
    await Keychain.resetGenericPassword();
    return true;
  } catch (error) {
    console.error('Failed to delete PIN:', error);
    return false;
  }
};

export const setBiometricEnabled = async (enabled: boolean): Promise<boolean> => {
  try {
    await Keychain.setGenericPassword(BIOMETRIC_ENABLED_KEY, enabled.toString(), {
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
    });
    return true;
  } catch (error) {
    console.error('Failed to save biometric preference:', error);
    return false;
  }
};

export const isBiometricEnabled = async (): Promise<boolean> => {
  try {
    const credentials = await Keychain.getGenericPassword();
    if (credentials && typeof credentials === 'object' && 'password' in credentials) {
      return credentials.password === 'true';
    }
    return false;
  } catch (error) {
    console.error('Failed to get biometric preference:', error);
    return false;
  }
}; 