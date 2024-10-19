import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Welcome from './onboard/Welcome'
import Purpose from './onboard/Purpose'
import Goals from './onboard/Goals'
import Commitment from './onboard/Commitment'
import GetStarted from './onboard/GetStarted'

const Stack = createStackNavigator();

export default function Onboard({ navigation }) {
  return (
    <View style={styles.container}>
      <Stack.Navigator initialRouteName="Screen1">
        <Stack.Screen 
          name="Screen1" 
          component={Welcome} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Screen2" 
          component={Purpose} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Screen3" 
          component={Goals} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Screen4" 
          component={Commitment} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Screen5" 
          component={GetStarted} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  }
})