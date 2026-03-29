// Permission is requested only when there is something worth notifying about
// Asking on page load is how apps end up in the browser blocked list

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function sendLocalNotification(title: string, body: string) {
  // Local notifications only -- no push server required for MVP
  if (Notification.permission !== 'granted') return
  new Notification(title, {
    body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
  })
}
