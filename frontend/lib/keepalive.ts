// Render free tier sleeps after 15 minutes of inactivity
// This pings the health endpoint every 14 minutes to prevent cold starts during active sessions
// It only runs while a user has the app open -- it is not a background service

const HEALTH_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/health`
const INTERVAL_MS = 14 * 60 * 1000 // 14 minutes

let intervalId: ReturnType<typeof setInterval> | null = null

export function startKeepalive() {
  if (intervalId) return // already running
  intervalId = setInterval(async () => {
    try {
      await fetch(HEALTH_URL, { method: 'GET' })
    } catch {
      // silence -- if the ping fails, the next user request will just be slow
    }
  }, INTERVAL_MS)
}

export function stopKeepalive() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}
