import { View, Text, StyleSheet, Button } from 'react-native'

import SimpleHeader from '../components/SimpleHeader'
import { createRelationship, getRelationships } from '../utils/db-relationship'
import { getUserIdFromLocalStorage } from '../utils/localStorage'
import { useEffect, useState } from 'react'

export default function AddFriend({ navigation }) {
  const [disabled, setDisabled] = useState(true)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const getInformationAboutUser = async () => {
      const result = await getUserIdFromLocalStorage()
      setUserId(result)
    }

    getInformationAboutUser()
  }, [])

  useEffect(() => {
    // disabled ability ot add friends if user id is not available
  }, [userId])

  return (
    <View style={styles.container}>
      <Text>HEEELLOOO</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
})