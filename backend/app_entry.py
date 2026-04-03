# NOTE: This imports from backend/main.py, NOT backend/app/main.py.
# The two files have diverged -- app/main.py has Sentry, validate_env(), and
# tighter CORS, but none of that runs in production because Render uses this
# entry point which loads backend/main.py instead.
from main import app

@app.get("/health-check")
def health_check():
    return {"status": "ok", "entry": "app_entry.py"}
