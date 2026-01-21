from main import app

@app.get("/health-check")
def health_check():
    return {"status": "ok", "entry": "app_entry.py"}
