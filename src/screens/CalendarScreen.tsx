import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {useColors} from '../constant/colors';
import {fontSize, wp} from '../helpers/globalFunction';
import {fonts} from '../constant/fonts';
import {useSelector} from 'react-redux';
import {RootState} from '../store';

type JournalEntry = {
  prompt: string;
  recordingDuration?: number;
  recordingUri?: string;
  response: string;
  timestamp: string;
};

type MarkedDates = {
  [date: string]: {marked: true};
};

const CalendarScreen = () => {
  const colors = useColors();
  const styles = createStyles(colors);
  const entries = useSelector((state: RootState) => state.journal.entries);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  const calendarTheme = {
    textDayFontFamily: fonts.bold,
    textMonthFontFamily: fonts.bold,
    todayButtonFontFamily: fonts.bold,
    textDayHeaderFontFamily: fonts.bold,
    textDayFontSize: fontSize(14),
    textMonthFontSize: fontSize(14),
    todayButtonFontSize: fontSize(14),
    textDayHeaderFontSize: fontSize(14),
    arrowColor: colors.gold,
    dotColor: colors.gold,
    todayTextColor: colors.sand,
    todayDotColor: colors.gold,
    selectedDotColor: colors.gold,
  };

  function getMarkedDates(data: JournalEntry[]): MarkedDates {
    data?.forEach(entry => {
      if (entry.timestamp) {
        const date = new Date(entry.timestamp).toISOString().split('T')[0];
        markedDates[date] = {marked: true};
      }
    });

    return markedDates;
  }

  useEffect(() => {
    const data = getMarkedDates(entries);
    console.log('🚀 ~ useEffect ~ data:', data);
    setTimeout(() => {
      setMarkedDates(data);
    }, 300);
  }, [entries]);

  return (
    <View>
      <Calendar
        style={styles.calendarStyle}
        theme={calendarTheme}
        markedDates={markedDates}
      />
    </View>
  );
};
const createStyles = (colors: any) =>
  StyleSheet.create({
    calendarStyle: {
      borderColor: colors.lightGray,
      borderWidth: 2,
      margin: wp(4),
      borderRadius: 10,
    },
  });
export default CalendarScreen;
