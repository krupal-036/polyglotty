# 🌐 Polyglotty

**Polyglotty** is a powerful, minimalistic web application that allows users to seamlessly translate text between languages and convert both the original and translated text into speech — right in your browser. Whether you're learning a new language, practicing pronunciation, or communicating across borders, Polyglotty has you covered.

Built using **Flask**, **JavaScript**, and **Google APIs**, this tool offers seamless translation and natural-sounding text-to-speech functionality, wrapped in a clean and responsive UI.

---
## ↗️ Live Demo: [polyglotty.vercel.app](https://polyglotty.vercel.app/)

<div align="center" style="display: flex; flex-direction: column; border: none; padding: 0; margin: 0; line-height: 0;">
  <img src="https://github.com/user-attachments/assets/8c3791ec-f135-43d0-8503-97936ea82fe4" alt="Screenshot 1" style="width: 100%; display: block; margin: 0; padding: 0; border: none;">
  <img src="https://github.com/user-attachments/assets/b1a6d718-34a1-47d0-84c3-ed2bae0b3ba4" alt="Screenshot 2" style="width: 100%; display: block; margin: 0; padding: 0; border: none;">
  <img src="https://github.com/user-attachments/assets/9e04469a-1604-47bd-a689-bdf55ec24eba" alt="Screenshot 3" style="width: 100%; display: block; margin: 0; padding: 0; border: none;">
</div>

---
## ✨ Features

- 🌍 Detects and translates between multiple languages
- 🔊 Text-to-Speech for both input and translated text
- 🔁 Real-time Text Translation
- 🗣️ Text-to-Speech (Input & Output)
- ⚡ Fast, intuitive, and responsive interface

---

## 📁 Folder Structure

```
polyglotty/
├── app.py                 # Flask backend logic
├── static/
│   ├── script.js          # JavaScript for interactivity
│   └── style.css          # Styling for the app
├── templates/
│   └── index.html         # Frontend HTML (rendered by Flask)
├── build.sh               # essential requirements for vercel
├── requrements.txt        # lists required python packages
├── vercel.json            # vercel json file
├── LICENCE                # MIT LICENCE
└── README.md              # Project documentation (this file)


```

---

## 🚀 Requirements

- Python 3.7 or higher
- pip (Python package manager)

### 📦 Python Packages Used
- Flask — Web framework for building the app
- googletrans (v4.0.0-rc1) — Language detection and translation

---

## 📚 Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python, Flask
- **APIs/Libraries**:
  - [`googletrans`](https://pypi.org/project/googletrans/) for translation

---

## 📄 requirements.txt

```
Flask
googletrans==4.0.0-rc1
```


## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/krupal-036/polyglotty.git
cd polyglotty
```

### 2. Set Up a Virtual Environment (Optional)

```bash
python -m venv venv
# Activate the environment:
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Required Packages

```bash
pip install Flask googletrans==4.0.0-rc1
```

Or install from requirements.txt:

```bash
pip install -r requirements.txt
```

### 4. Run the Flask App

```bash
python app.py
```

---

## 🚀 Usage

### 1. After running `python app.py`, open your web browser and navigate to `http://127.0.0.1:5000` (or the address provided in the console).
### 2. Type or paste text into the "Enter Text" box. The application will attempt to detect the source language automatically.
### 3. Select the desired target language from the dropdown list (you can search by name or code).
### 4. Click the "Translate" button.
### 5. Use the "Speak" buttons to hear the original or translated text aloud.
### 6. Use "Copy" to copy the translation and "Clear" to reset the input.

---

## 📌 Future Improvements

- 🎙️ Add voice input (speech-to-text)
- 💬 Chat-style history of translations
- 🌐 Multilingual UI
- 🔁 Bi-directional language swap button

---

## 🛡️ License

This project is licensed under the **MIT License** — feel free to use and modify it.

---

## 👨‍💻 Author

Developed by [Krupal Fataniya](https://github.com/krupal-036)

Feel free to contribute or fork the project!

For any issues, feel free to ask [Krupal](mailto:krupalfataniya007@gmail.com). 😊
