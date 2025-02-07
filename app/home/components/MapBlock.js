import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome5'

import { useTheme } from "../../hooks/ThemeProvider";
import MapLine from "./MapLine";
import BasicButton from "../../components/BasicButton";

export default function MapBlock({ 
  navigation,
  status='locked',
}) {
  const { theme } = useTheme()
  const [styles, setStyles] = useState(style(theme))
  useEffect(() => { setStyles(style(theme)) }, [theme])

  return (
    <>
      <MapLine />
      <View
        style={[
          styles.container,
          status === "locked" ? styles.locked : status === "active" ? styles.active : styles.complete,
        ]}
      >
        {status === "locked" && (
          <Icon name="lock" size={24} color={theme.secondaryText} />
        )}
        <View style={{ marginVertical: 10 }}>
          <Text style={styles.planItemHeader}>ALMA 5</Text>
          <Text style={styles.planItemVerses}>verses 13-24</Text>
        </View>

        {status === "active" && (
          <BasicButton
            title={`${7} minutes`}
            icon='clock-o'
            onPress={() => navigation.navigate("StudyPage")}
            style={{ marginBottom: 10 }}
          />
        )}
      </View>
    </>
  );
}

function style(theme) {
  return StyleSheet.create({
    container: {
      borderRadius: 20,
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    locked: {
      borderWidth: 4,
      borderColor: theme.primaryBorder,
      borderStyle: 'dashed',
    },
    active: {
      backgroundColor: theme.primaryBackground,
    },
    complete: {
      backgroundColor: theme.primaryBackground,
    },
    planItemHeader: {
      fontSize: 24,
      fontWeight: 'bold',
      fontFamily: 'nunito-bold',
      color: theme.secondaryText,
      textAlign: 'center',
    },
    planItemVerses: {
      fontSize: 16,
      fontFamily: 'nunito-regular',
      color: theme.secondaryText,
      textAlign: 'center',
    },
  })
}