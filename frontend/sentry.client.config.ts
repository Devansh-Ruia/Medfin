import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Never send user input or document content
  beforeSend(event) {
    if (event.request?.data) delete event.request.data
    return event
  },
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  // Replay is disabled -- it would capture sensitive document content
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
})
