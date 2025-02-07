import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import BasicButton from '../components/BasicButton';
import BorderBoxWithHeaderText from '../components/BorderBoxWithHeaderText';
import { gen } from '../utils/styling/colors';

const PlanContent = ({ content, time, bookColor }) => {
  return (
    <View style={styles.planContentContainer}>
      <View style={[styles.book, bookColor instanceof Array == false && { backgroundColor: bookColor }]}>
        {
          // If content is an array, map through it and display each book in a mini book
          content instanceof Array
            ? content.map((book, index) => (
                <View key={`mini-book-${index}`} style={[styles.miniBook, { backgroundColor: bookColor[index] }]}>
                  <Text style={styles.innerBookText}>{book}</Text>
                </View>
              ))
            : <Text style={styles.innerBookText}>{content}</Text>
        }
      </View>
      <View>
        {
          // If content is an array, map through it and display each book 
          content instanceof Array
            ? content.map((book, index) => (
                <Text key={`book-${book}-${index}`} style={[styles.optionText, { color: gen.heckaGray2 }]}>{index !== 0 && "+ "}{book}</Text>
              ))
            : <Text style={[styles.optionText, { color: gen.heckaGray2 }]}>{content}</Text>
        }
        <Text style={styles.optionText}><Icon name='clock-o' size={16} color={gen.darkGray} /> {time}</Text>
      </View>
    </View>
  )
}

export default function Planify({ 
  setCurrentScreen, 
  planData,
  setPlanData,
}) {
  const [disabled, setDisabled] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)

  return (
    <View style={styles.container}>
      <Text style={styles.header}>LETS CREATE A PLAN</Text>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <BorderBoxWithHeaderText 
          onPress={() => {
            setPlanData(prev => ({ ...prev, plan: ['Come Follow Me'] }))
            setCurrentScreen(prev => prev + 1)
          }}
          recommended
        >
          <PlanContent 
            content="Come Follow Me" 
            time="87d"
            bookColor={gen.maroon}
          />
        </BorderBoxWithHeaderText>
        <BorderBoxWithHeaderText
          onPress={() => {
            setPlanData(prev => ({ ...prev, plan: ['Book of Mormon'] }))
            setCurrentScreen(prev => prev + 1)
          }} 
        >
          <PlanContent 
            content="Book of Mormon" 
            time="245d"
            bookColor={gen.navy}
          />
        </BorderBoxWithHeaderText>
        <BorderBoxWithHeaderText
          onPress={() => {
            setPlanData(prev => ({ ...prev, plan: ['Book of Mormon', 'New Testament'] }))
            setCurrentScreen(prev => prev + 1)
          }}
        >
          <PlanContent 
            content={["Book of Mormon", "New Testament"]}
            time="184d"
            bookColor={[gen.navy, "#000"]}
          />
        </BorderBoxWithHeaderText>
        <TouchableOpacity 
          style={styles.customButton}
          onPress={() => setModalVisible(!modalVisible)}
        >
          <Text style={[styles.optionText, { textAlign: 'center' }]}>
            <Icon name='pencil' size={16} color={gen.darkGray} /> CUSTOM 
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal
        presentationStyle='pageSheet' 
        animationType='slide'
        onRequestClose={() => setModalVisible(!setModalVisible)}
        visible={modalVisible}
      >
        <View style={styles.modal}>
          <View style={{ padding: 40 }}>
            <Text style={[styles.header, { marginTop: 0 }]}>CREATE A PLAN</Text>
          </View>

          <BasicButton
            title="SELECT"
            onPress={() => setCurrentScreen(prev => prev + 1)}
            style={{ position: 'absolute', bottom: 60 }}
            disabled={disabled}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scrollContainer: {
    width: '100%',
    paddingHorizontal: 40,
    paddingTop: 50,
  },
  header: {
    marginTop: 70,
    fontSize: 20,
    fontFamily: 'nunito-bold',
  },
  questionBox: {
    width: '90%',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    paddingTop: 60,
  },
  boxSelected: {
    borderColor: gen.primaryColor,
    color: gen.primaryColor,
  },
  optionText: {
    fontSize: 16,
    color: gen.darkGray,
    fontFamily: 'nunito-bold',
  },
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  book: {
    width: 65,
    height: 80,
    padding: 5,
    borderRadius: 10,
    backgroundColor: gen.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    overflow: 'hidden',
  },
  innerBookText: {
    fontSize: 10,
    color: gen.primaryColor,
    textAlign: 'center',
    fontFamily: 'nunito-bold',
  },
  bookText: {
    fontSize: 16,
    fontFamily: 'nunito-bold',
  },
  miniBook: {
    width: 65,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planContentContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  modal: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  customButton: {
    borderColor: gen.lightGray,
    borderWidth: 5,
    width: '100%',
    padding: 20,
    borderRadius: 15,
  }
})