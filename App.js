import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
} from 'react-native';

import DailyPromptScreen from './src/screens/DailyPromptScreen.tsx';
import JournalScreen from './src/screens/JournalScreen.tsx';
import ProfileScreen from './src/screens/ProfileScreen.tsx';
import EvolutionScreen from './src/screens/EvolutionScreen.tsx';
import PremiumScreen from './src/screens/PremiumScreen.tsx';
import SettingsScreen from './src/screens/SettingsScreen.tsx';
import {colors} from './src/constant/colors';
import {icons} from './src/constant/icons.js';
import {hp} from './src/helpers/globalFunction.js';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.navy,
        },
        tabBarActiveTintColor: colors.sky,
        tabBarInactiveTintColor: colors.beige,
        headerShown: false,
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="Daily Prompt"
        component={DailyPromptScreen}
        options={{
          tabBarIcon: ({color}) => (
            <Image
              source={icons.pencil}
              style={{height: hp(3.69), width: hp(3.69)}}
              tintColor={color}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{
          tabBarIcon: ({color}) => (
            <Image
              source={icons.journal}
              style={{height: hp(3.69), width: hp(3.69)}}
              tintColor={color}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color}) => (
            <Image
              source={icons.user}
              style={{height: hp(3.69), width: hp(3.69)}}
              tintColor={color}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Evolution"
        component={EvolutionScreen}
        options={{
          tabBarIcon: ({color}) => (
            <Image
              source={icons.evolution}
              style={{height: hp(3.69), width: hp(3.69)}}
              tintColor={color}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Premium"
        component={PremiumScreen}
        options={{
          tabBarIcon: ({color}) => (
            <Image
              source={icons.premium}
              style={{height: hp(3.69), width: hp(3.69)}}
              tintColor={color}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="MainTabs"
            component={TabNavigator}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              presentation: 'modal',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});

export default App;
