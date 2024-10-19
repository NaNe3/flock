import { View, Text, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

import HomePage from './home/HomePage';
import Library from './home/Library';
import Chapter from './home/Chapter';
import NavigationBar from './components/NavigationBar';

const Stack = createStackNavigator();

export default function Home({ navigation }) {
  return (
    <>
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen 
          name="Home"
          component={HomePage}
          options={{ headerShown: false, animationEnabled: false }}
        />
        <Stack.Screen 
          name="Library" 
          component={Library} 
          options={{ headerShown: false, animationEnabled: false }}
        />
        <Stack.Screen
          name='Chapter'
          component={Chapter}
          options={{ headerShown: false, animationEnabled: false }}
        />

      </Stack.Navigator>
    
      <NavigationBar />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  }
})