from flask import Flask, render_template, jsonify, request
import json
import urllib.parse
import os

app = Flask(__name__, static_folder="static/")

DATA_FILE = "analytics.json"

# Custom Jinja‑Filter für URL-Encoding
@app.template_filter('urlencode')
def urlencode_filter(s):
    if isinstance(s, str):
        return urllib.parse.quote(s)
    return s

# Professionsdaten aus der JSON‑Datei laden (UTF-8‑kodiert)
def load_professions():
    with open("professions.json", "r", encoding="utf-8") as file:
        return json.load(file)

@app.route("/")
def home():
    professions = load_professions()
    return render_template("index.html", professions=professions)

@app.route("/profession/<name>")
def profession_detail(name):
    professions = load_professions()
    decoded_name = urllib.parse.unquote(name)
    profession = next((p for p in professions if p["name"] == decoded_name), None)
    if profession:
        return render_template("profession.html", profession=profession)
    return "Profession not found", 404

@app.route("/cookie-policy")
def cookie_policy():
    return render_template("cookie_policy.html")

@app.route("/datenschutz")
def datenschutz():
    return render_template("datenschutz.html")

# Funktion zum Laden der bisherigen Daten
def load_analytics_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as file:
            try:
                return json.load(file)
            except json.JSONDecodeError:
                return {}  # Falls Datei beschädigt ist
    return {}

# Funktion zum Speichern der Analysedaten
def save_analytics_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=4, ensure_ascii=False)

# Endpunkt zur Speicherung der Analyse-Ereignisse
@app.route("/log-event", methods=["POST"])
def log_event():
    analytics_data = load_analytics_data()  # Bestehende Daten laden
    event_data = request.get_json() or {}

    # IP-Adresse und User-Agent erfassen
    ip_address = request.remote_addr
    user_agent = request.headers.get("User-Agent")

    # Falls IP noch nicht erfasst wurde, leeres Array anlegen
    if ip_address not in analytics_data:
        analytics_data[ip_address] = {"user_agent": user_agent, "events": []}

    # Event zur Liste der IP-Adresse hinzufügen
    analytics_data[ip_address]["events"].append(event_data)

    # Daten speichern
    save_analytics_data(analytics_data)

    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False, host="0.0.0.0", port=3000)
