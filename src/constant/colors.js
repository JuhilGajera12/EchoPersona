import {useSelector} from 'react-redux';

export const useColors = () => {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);

  return {
    white: isDarkMode ? '#000000' : '#FFFFFF',
    black: isDarkMode ? '#FFFFFF' : '#000000',
    lightGray: isDarkMode ? '#1E1E1E' : '#F5F5F5',
    gold: '#EFBF04',
    darkGray: isDarkMode ? '#333333' : '#F5F5F5',
    sand: isDarkMode ? '#CCCCCC' : '#AF9F84',
    error: '#FF2C2C',
  };
};
