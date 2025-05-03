from flask import Flask, render_template, request, jsonify
from googletrans import Translator

import os 

app = Flask(__name__)
translator = Translator()

static_dir = os.path.join(os.path.dirname(__file__), 'static')
if not os.path.exists(static_dir):
    try:
        os.makedirs(static_dir)
        print(f"Created static directory at: {static_dir}")
    except OSError as e:
        print(f"Error creating static directory: {e}")

@app.route("/")
def home():
    """Serves the main HTML page."""
    return render_template("index.html")

@app.route("/translate", methods=["POST"])
def translate_text():
    """Translates text using googletrans."""
    data = request.json
    text = data.get("text")
    target_lang = data.get("target_lang")

    if not text or not target_lang:
        return jsonify({"error": "Missing text or target language"}), 400

    try:

        if not text.strip():
             return jsonify({"translated_text": ""})

        translated = translator.translate(text, dest=target_lang)
        return jsonify({"translated_text": translated.text})
    except Exception as e:
        print(f"Translation Error: {e}")
        error_message = "Translation failed. Please check the input or try again later."
        if "invalid destination language" in str(e).lower():
             error_message = "Invalid target language selected."
        return jsonify({"error": error_message}), 500

@app.route("/detect_lang", methods=["GET"])
def detect_lang():
    """Detects the language of the provided text."""
    text = request.args.get("text", "")

    if not text or not text.strip():
        return jsonify({"detected_lang": "N/A", "confidence": 0}) 

    try:
        detected = translator.detect(text)
        confidence = detected.confidence if detected.confidence is not None else 0
        return jsonify({"detected_lang": detected.lang, "confidence": confidence})
    except Exception as e:
        print(f"Detection Error: {e}")
        return jsonify({"error": "Language detection failed.", "detected_lang": "Error", "confidence": 0}), 500

if __name__ == "__main__":
    app.run(debug=True)
