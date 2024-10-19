import { StyleSheet, Text, View } from "react-native";

const WeakRow = ({ children, style }) => {
  return (
    <View style={[styles.weakRow, style]}>
      {children}
    </View>
  )
}

export default function WeakContentBox({ title }) {
  const weakRows = [
    {
      "reward": 10,
      "title": "LIKE 10 SCRIPTURES"
    },
    {
      "reward": 15,
      "title": "SEND ONE MESSAGE TO A FRIEND"
    },
    {
      "reward": 20,
      "title": "READ FOR 15 MINUTES"
    }
  ]

  return (
    <View style={styles.container}>
      <Text style={styles.containerTitle}>{title}</Text>
      <View style={styles.contentBox}>
        {weakRows.map((row, index) => {
          return (
            <WeakRow key={`weak-${index}`} style={index === weakRows.length-1 && { borderBottomWidth: 0 }}>
              <Text style={[styles.rowText, { marginLeft: 10, fontSize: 20, color: "#05D5FA" }]}>{row.reward}</Text>
              <Text style={[styles.rowText, { marginLeft: 35, color: "#777" }]}>{row.title}</Text>
            </WeakRow>
          )
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  containerTitle: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
    color: '#616161',
    marginLeft: 15,
  },
  contentBox: {
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 15,
    // borderWidth: 3,
    // borderColor: '#616161',
    backgroundColor: '#fff',
  },
  weakRow: {
    width: '100%',
    padding: 20,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#616161',

    overflow: 'hidden',
  },
  rowText: {
    fontSize: 16,
    fontFamily: 'nunito-regular',
    color: '#222',
  }
})