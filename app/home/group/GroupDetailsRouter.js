import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';

import { gen } from '../../utils/styling/colors';

import AllGroupMembers from './GroupDetails/AllGroupMembers';
import GroupDetails from './GroupDetails/GroupDetails';
import EditGroupInfo from './GroupDetails/EditGroupInfo';
import GroupDelete from './GroupDetails/GroupDelete';

const Stack = createStackNavigator()

export default function GroupDetailsRouter({ route }) {
  // const { group_id, group_name, group_avatar, group_plan, members } = route.params

  return (
    <View style={styles.container}>
      <Stack.Navigator initialRouteName='GroupDetails'>
        <Stack.Screen
          name="GroupDetails"
          component={GroupDetails}
          options={{ headerShown: false, animationEnabled: true}}
          initialParams={route.params}
        />
        <Stack.Screen
          name="AllGroupMembers"
          component={AllGroupMembers}
          options={{ headerShown: false, animationEnabled: true}}
        />
        <Stack.Screen
          name="EditGroupInfo"
          component={EditGroupInfo}
          options={{ headerShown: false, animationEnabled: true}}
        />
        <Stack.Screen
          name="GroupDelete"
          component={GroupDelete}
          options={{ headerShown: false, animationEnabled: true}}
        />
      </Stack.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gen.primaryBackground,
  },
})