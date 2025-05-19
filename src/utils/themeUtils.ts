import {Appearance} from 'react-native';

export const getSystemTheme = () => {
  return Appearance.getColorScheme() === 'dark';
};
