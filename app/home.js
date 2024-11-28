import { createStackNavigator } from '@react-navigation/stack';

import HomePage from './home/HomePage';
import GroupPage from './home/GroupPage';
import LibraryPage from './home/LibraryPage';

import InteractiveHeaderBar from './components/InteractiveHeaderBar';
import { View } from 'react-native';

const Stack = createStackNavigator()

export default function Home() {
  return (
    <View style={{ flex: 1 }}>
      <InteractiveHeaderBar />
      <Stack.Navigator initialRouteName='Home'>
        <Stack.Screen 
          name="Home"
          component={HomePage}
          options={{ headerShown: false, animationEnabled: false}}
        />
        <Stack.Screen 
          name="GroupPage" 
          component={GroupPage} 
          options={{ headerShown: false, animationEnabled: false }}
        />
        <Stack.Screen 
          name="LibraryPage" 
          component={LibraryPage} 
          options={{ headerShown: false, animationEnabled: false }}
        />
      </Stack.Navigator>
    </View>
  );
}
