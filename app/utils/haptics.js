import * as Haptics from 'expo-haptics'

export const hapticSelect = async () => {
  await Haptics.selectionAsync()
}

export const hapticSuccess = () => {
  Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Success
  )
}

export const hapticError = () => {
  Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Error
  )
}

export const hapticWarning = () => {
  Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Warning
  )
}

export const hapticImpactLight = () => {
  Haptics.impactAsync(
    Haptics.ImpactFeedbackStyle.Light
  )
}

export const hapticImpactMedium = () => {
  Haptics.impactAsync(
    Haptics.ImpactFeedbackStyle.Medium
  )
}

export const hapticImpactHeavy = () => {
  Haptics.impactAsync(
    Haptics.ImpactFeedbackStyle.Heavy)
}

export const hapticImpactRigid = () => {
  Haptics.impactAsync(
    Haptics.ImpactFeedbackStyle.Rigid
  )
}

export const hapticImpactSoft = () => {
  Haptics.impactAsync(
    Haptics.ImpactFeedbackStyle.Soft
  )
}
