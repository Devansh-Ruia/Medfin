export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "APIError"
  }
}

export async function parseAPIError(response: Response): Promise<APIError> {
  let message = "An unexpected error occurred"
  try {
    const body = await response.json()
    message = body.detail ?? body.message ?? message
  } catch {
    // response body was not JSON -- use status-based fallback
  }

  const statusMessages: Record<number, string> = {
    413: "File is too large. Maximum size is 10MB.",
    415: "Unsupported file type. Upload a PDF or image.",
    422: message,
    429: "Too many requests. Please wait a moment and try again.",
    500: "Server error. Please try again.",
  }

  return new APIError(
    response.status,
    statusMessages[response.status] ?? message,
  )
}
