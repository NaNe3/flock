import { StyleSheet, View } from 'react-native'
import Modal from 'react-native-modal'

export default function BasicModal({ children, visible, setVisible, height }) {

  return (
    <Modal
        isVisible={visible}
        onBackdropPress={() => setVisible(false)}
        swipeDirection={["down"]}
        onSwipeComplete={() => setVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropColor="black"
        backdropOpacity={0.4}
        style={styles.modal}
        propagateSwipe={true}
      >
      <View style={[styles.modalContent, { height: height }]}>
        <View style={styles.draggableBar} />
        {children}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    margin: 0,
  },
  modalContent: {
    marginTop: 'auto',
    marginBottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  draggableBar: {
    width: 35,
    height: 4,
    borderRadius: 2.5,
    backgroundColor: '#888',
    alignSelf: 'center',
    marginVertical: 10,
  },
})