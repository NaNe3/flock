import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';

import AddGroupMembers from './GroupDetails/AddGroupMembers';
import AllGroupMembers from './GroupDetails/AllGroupMembers';
import GroupDetails from './GroupDetails/GroupDetails';
import EditGroupInfo from './GroupDetails/EditGroupInfo';
import GroupDelete from './GroupDetails/GroupDelete';
import GroupLeave from './GroupDetails/GroupLeave';
import { useTheme } from '../../hooks/ThemeProvider';
import { useEffect, useState } from 'react';

const Stack = createStackNavigator()

export default function GroupDetailsRouter({ route }) {
  // const { group_id, group_name, group_avatar, group_plan, members } = route.params
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

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
          name="AddGroupMembers"
          component={AddGroupMembers}
          options={{ headerShown: false, animationEnabled: true}}
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
          name="GroupLeave"
          component={GroupLeave}
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

function style(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
    },
  })
}