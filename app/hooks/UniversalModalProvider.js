import { createContext, useContext, useRef, useState } from "react"
import BasicBottomSheet from "../home/components/BasicBottomSheet"

const ModalContext = createContext()

export default function UniversalModalProvider({ children }) {
  const [visible, setVisible] = useState(false)
  const [modal, setModal] = useState(null)
  const [title, setTitle] = useState("")

  const bottomSheet = useRef(null)

  const closeBottomSheet = () => {
    bottomSheet.current.closeBottomSheet()
    setTimeout(() => {
      setVisible(false)
      setModal(null)
      setTitle("")
    }, 200)
  }

  return (
    <ModalContext.Provider value={{ visible, setVisible, setModal, setTitle, closeBottomSheet }}>
      {children}
      {visible &&
        <BasicBottomSheet
          title={title}
          setVisibility={setVisible}
          ref={bottomSheet}
        >
          {modal}
        </BasicBottomSheet>
      }
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  return useContext(ModalContext)
}

// function style(theme) {
//   return StyleSheet.create({

//   })
// }