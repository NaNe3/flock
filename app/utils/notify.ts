import * as Notifications from "expo-notifications";

const notifications = {
  daily: {
    title: "Good morning!",
    body: "time to start your day with a quick study ✨",
  },
  firstReminder: {
    title: "📚 Did you forget to study?",
    body: "Any time you contribute to your spiritual growth is time well spent! 🌱",
  },
  secondReminder: {
    title: "Time to wind down!",
    body: "Don't forget to study your scriptures! 🔭",
  },
  thirdReminder: {
    type: 'streak',
    title: "uhhhh did you forget something?",
    body: "Nephi will be dissapointed if you lose your streak! 🥺",
  },
  fourthReminder: {
    title: "🕚 You're almost out of time!!",
    body: "Don't let the day end without studying the scriptures!",
  },
  lastReminder: {
    type: 'streak',
    title: "💛💛💛",
    body: "You are going to lose your streak soon!!!",
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

export const scheduleNotificationOnce = async (
  title: string,
  body: string,
  time: number
) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
      },
      trigger: {
        type: 'timeInterval',
        seconds: time,
        repeats: false,
      } as Notifications.TimeIntervalTriggerInput,
    })
  } catch (error) {
    console.log('error', error)
  }
}

export const scheduleDailyNotification = async (
  title: string,
  body: string,
  time: number,
) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
      },
      trigger: {
        type: 'daily',
        hour: time,
        minute: 0,
      } as Notifications.DailyTriggerInput
    })
  } catch (error) {
    console.log('error', error)
  }
}

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync()
}

export const checkWhichNotificationsAreActive = async () => {
  const notifications = await Notifications.getAllScheduledNotificationsAsync()

  return {
    titles: notifications.map((notification) => notification.content.title),
    active: notifications
  }
}

export const checkRequiredDailyNotifications = async () => {
  const { titles } = await checkWhichNotificationsAreActive()
  
  if (!titles.includes(notifications.daily.title)) {
    await scheduleDailyNotification(notifications.daily.title, notifications.daily.body, 7)
  }

  if (!titles.includes(notifications.firstReminder.title)) {
    await scheduleDailyNotification(notifications.firstReminder.title, notifications.firstReminder.body, 18)
  }

  if (!titles.includes(notifications.secondReminder.title)) {
    await scheduleDailyNotification(notifications.secondReminder.title, notifications.secondReminder.body, 20)
  }

  if (!titles.includes(notifications.fourthReminder.title)) {
    await scheduleDailyNotification(notifications.fourthReminder.title, notifications.fourthReminder.body, 23)
  }
}

const getTimeUntilTommorow = (hour: number) => {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const restOfTimeToday = Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
  const timeUntilHour = hour * 3600
 
  return restOfTimeToday + timeUntilHour
}

export const manageStreakNotifications = async () => {
  // remove existing streak notifications
  const { active } = await checkWhichNotificationsAreActive()

  const streak = active.filter((notification) => 
    notification.content.title === notifications.thirdReminder.title || 
    notification.content.title === notifications.lastReminder.title
  )
  streak.forEach(async (notification) => {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier)    
  })

  // schedule new streak notifications
  // 10:00 PM third reminder
  await scheduleNotificationOnce(
    notifications.thirdReminder.title, 
    notifications.thirdReminder.body, 
    getTimeUntilTommorow(22)
  )
  // 11:30 PM last reminder
  await scheduleNotificationOnce(
    notifications.lastReminder.title, 
    notifications.lastReminder.body, 
    getTimeUntilTommorow(23.5)
  )
}