document.addEventListener("DOMContentLoaded", function () {

    const textInput = document.getElementById("textInput");
    const languageSelect = document.getElementById("languageSelect");
    const languageSearch = document.getElementById("languageSearch");
    const translateBtn = document.getElementById("translateBtn");
    const readInputBtn = document.getElementById("readInputBtn");
    const readOutputBtn = document.getElementById("readOutputBtn");
    const stopBtn = document.getElementById("stopBtn");
    const copyBtn = document.getElementById("copyBtn");
    const clearInputBtn = document.getElementById("clearInputBtn");
    const outputText = document.getElementById("outputText");
    const detectedLangSpan = document.getElementById("detectedLang");
    const detectConfidenceSpan = document.getElementById("detectConfidence");
    const translationSpinner = translateBtn.querySelector(".spinner-border");
    const copyToastEl = document.getElementById('copyToast');
    const errorToastEl = document.getElementById('errorToast');
    const errorToastMsg = document.getElementById('errorToastMessage');

    const swapBtn = document.getElementById("swapBtn");
    const historyToggle = document.getElementById("historyToggle");
    const historySection = document.getElementById("historySection");
    const historyList = document.getElementById("historyList");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");
    const closeHistoryBtn = document.getElementById("closeHistoryBtn");

    const copyToast = new bootstrap.Toast(copyToastEl);
    const errorToast = new bootstrap.Toast(errorToastEl);

    const synth = window.speechSynthesis;
    let currentUtterance = null;
    let detectTimeout;

    if (!synth) {
        console.error("Speech Synthesis not supported by this browser.");
        readInputBtn.disabled = true;
        readOutputBtn.disabled = true;
        stopBtn.disabled = true;
        readInputBtn.title = "Speech synthesis not supported by your browser";
        readOutputBtn.title = "Speech synthesis not supported by your browser";
        stopBtn.title = "Speech synthesis not supported by your browser";
    }

    function showLoading(show) {
        if (show) {
            translationSpinner.classList.remove('d-none');
            translateBtn.disabled = true;
            translateBtn.querySelector('.bi-translate').classList.add('d-none');
            copyBtn.disabled = true;
            clearInputBtn.disabled = true;
            languageSelect.disabled = true;
            languageSearch.disabled = true;
        } else {
            translationSpinner.classList.add('d-none');
            translateBtn.disabled = false;
            translateBtn.querySelector('.bi-translate').classList.remove('d-none');
            copyBtn.disabled = false;
            clearInputBtn.disabled = false;
            languageSelect.disabled = false;
            languageSearch.disabled = false;
        }
    }

    function showErrorToast(message = "An error occurred.") {
        errorToastMsg.textContent = message;
        errorToast.show();
    }

    function stopSpeech() {
        if (synth.speaking) {
            console.log("Cancelling speech synthesis.");
            synth.cancel();
        }
        resetSpeechButtons();
    }

    function resetSpeechButtons() {
        readInputBtn.disabled = false;
        readOutputBtn.disabled = false;
        stopBtn.disabled = true;
    }

    function speakText(text, langCode) {
        stopSpeech();

        if (!text || !text.trim()) {
            showErrorToast("Nothing to speak.");
            resetSpeechButtons();
            return;
        }
        if (!langCode || ["N/A", "Unknown", "Error"].includes(langCode)) {
            showErrorToast("Cannot speak text without a valid language code.");
            resetSpeechButtons();
            return;
        }
        if (!synth) {
            showErrorToast("Speech synthesis is not supported by your browser.");
            resetSpeechButtons();
            return;
        }

        const language = langCode;

        console.log(`Requesting Speech Synthesis: lang=${language}, text=${text.substring(0, 30)}...`);

        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.lang = language;
        currentUtterance.onerror = function (event) {
            console.error("SpeechSynthesisUtterance.onerror", event);
            showErrorToast(`Speech error: ${event.error}. Your browser might not support the selected language ('${language}').`);
            resetSpeechButtons();
            currentUtterance = null;
        };
        currentUtterance.onstart = function (event) {
            console.log("SpeechSynthesisUtterance.onstart");
            readInputBtn.disabled = true;
            readOutputBtn.disabled = true;
            stopBtn.disabled = false;
        }
        currentUtterance.onend = function (event) {
            console.log("SpeechSynthesisUtterance.onend");
            resetSpeechButtons();
            currentUtterance = null;
        };

        readInputBtn.disabled = true;
        readOutputBtn.disabled = true;
        stopBtn.disabled = false;

        synth.speak(currentUtterance);
    }

    function filterLanguages(filterValue) {
        const options = languageSelect.options;
        let firstVisibleOptionValue = null;

        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            const text = option.textContent.toLowerCase();
            const value = option.value.toLowerCase();
            const shouldDisplay = (filterValue === "" || text.includes(filterValue) || value.startsWith(filterValue));
            option.style.display = shouldDisplay ? "" : "none";
            if (shouldDisplay && firstVisibleOptionValue === null && option.value) {
                firstVisibleOptionValue = option.value;
            }
        }
    }

    languageSearch.addEventListener('input', function () {
        const searchValue = this.value.toLowerCase().trim();
        filterLanguages(searchValue);

        if (searchValue.length >= 2) {
            let exactMatchOption = null;
            const options = languageSelect.options;
            for (let i = 0; i < options.length; i++) {
                const option = options[i];
                if (option.style.display !== 'none' && option.value.toLowerCase() === searchValue) {
                    exactMatchOption = option;
                    break;
                }
            }
            if (exactMatchOption) {
                languageSelect.value = exactMatchOption.value;
            }
        }
    });

    textInput.addEventListener("input", function () {
        clearTimeout(detectTimeout);
        const text = this.value;
        if (!text.trim()) {
            detectedLangSpan.innerText = "N/A";
            detectConfidenceSpan.innerText = "";
            stopSpeech();
            return;
        }

        detectedLangSpan.innerText = "Detecting...";
        detectConfidenceSpan.innerText = "";

        detectTimeout = setTimeout(() => {
            fetch(`/detect_lang?text=${encodeURIComponent(text)}`)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    if (data.error) {
                        detectedLangSpan.innerText = "Error";
                        detectConfidenceSpan.innerText = "";
                        console.error("Detection Error:", data.error);
                    } else if (data.detected_lang && data.detected_lang !== "N/A") {
                        detectedLangSpan.innerText = data.detected_lang;

                        if (data.confidence && typeof data.confidence === 'number' && data.confidence > 0) {
                            detectConfidenceSpan.innerText = `(${(data.confidence * 100).toFixed(0)}%)`;
                        } else {
                            detectConfidenceSpan.innerText = "";
                        }
                    } else {
                        detectedLangSpan.innerText = "Unknown";
                        detectConfidenceSpan.innerText = "";
                    }
                })
                .catch(error => {
                    console.error("Error detecting language:", error);
                    detectedLangSpan.innerText = "Error";
                    detectConfidenceSpan.innerText = "";
                    showErrorToast("Could not detect language.");
                });
        }, 500);
    });

    translateBtn.addEventListener("click", function () {
        stopSpeech();
        const text = textInput.value;
        const targetLang = languageSelect.value;
        if (!text.trim()) { showErrorToast("Please enter text to translate."); return; }
        if (!targetLang) { showErrorToast("Please select a target language."); return; }
        showLoading(true);
        outputText.value = "";
        fetch("/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text, target_lang: targetLang })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errData => { throw new Error(errData.error || `HTTP error! status: ${response.status}`); })
                        .catch(() => { throw new Error(`HTTP error! status: ${response.status}`); });
                }
                return response.json();
            })
            .then(data => {
                if (data.translated_text !== undefined) {
                    outputText.value = data.translated_text;

                    saveToHistory(
                        text,
                        data.translated_text,
                        detectedLangSpan.innerText,
                        targetLang
                    );
                }
                else if (data.error) {
                    console.error("Translation Error:", data.error);
                    showErrorToast(data.error);
                    outputText.value = "";
                }
                else {
                    console.error("Unexpected response format:", data);
                    showErrorToast("Received an unexpected response from the server.");
                    outputText.value = "";
                }
            })
            .catch(error => {
                console.error("Fetch Error (Translate):", error);
                showErrorToast(error.message || "Translation request failed.");
                outputText.value = "";
            })
            .finally(() => { showLoading(false); });
    });

    readInputBtn.addEventListener("click", function () {
        const text = textInput.value;
        const langCode = detectedLangSpan.innerText.split(' ')[0];
        speakText(text, langCode);
    });

    readOutputBtn.addEventListener("click", function () {
        const text = outputText.value;
        const langCode = languageSelect.value;
        speakText(text, langCode);
    });

    stopBtn.addEventListener("click", stopSpeech);

    copyBtn.addEventListener("click", function () {
        const textToCopy = outputText.value;
        if (!textToCopy.trim()) { showErrorToast("Nothing to copy."); return; }
        navigator.clipboard.writeText(textToCopy)
            .then(() => { copyToast.show(); })
            .catch(err => {
                console.error("Failed to copy text: ", err);
                showErrorToast("Failed to copy text to clipboard.");
            });
    });

    clearInputBtn.addEventListener("click", function () {
        stopSpeech();
        textInput.value = "";
        outputText.value = "";
        detectedLangSpan.innerText = "N/A";
        detectConfidenceSpan.innerText = "";
        languageSearch.value = "";
        filterLanguages("");
        languageSelect.value = 'en';
        textInput.focus();
    });

    swapBtn.addEventListener("click", function () {
        const originalText = textInput.value;
        const translatedText = outputText.value;
        const detectedLang = detectedLangSpan.innerText;
        const targetLang = languageSelect.value;

        textInput.value = translatedText;
        outputText.value = originalText;

        if (detectedLang && detectedLang !== "N/A" && detectedLang !== "Error" && detectedLang !== "Unknown") {
            const options = languageSelect.options;
            for (let i = 0; i < options.length; i++) {
                if (options[i].value === detectedLang) {
                    languageSelect.value = detectedLang;
                    break;
                }
            }

            detectedLangSpan.innerText = targetLang;
            detectConfidenceSpan.innerText = "";

            if (translatedText.trim()) {
                const event = new Event('input', { bubbles: true });
                textInput.dispatchEvent(event);
            }
        }
    });

    function saveToHistory(originalText, translatedText, sourceLang, targetLang) {
        if (!originalText.trim() || !translatedText.trim()) return;

        const historyItem = {
            id: Date.now(),
            originalText,
            translatedText,
            sourceLang,
            targetLang,
            timestamp: new Date().toISOString()
        };

        let history = JSON.parse(localStorage.getItem('polyglottyHistory') || '[]');

        history.unshift(historyItem);

        if (history.length > 50) {
            history = history.slice(0, 50);
        }

        localStorage.setItem('polyglottyHistory', JSON.stringify(history));
        loadHistory();
    }

    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('polyglottyHistory') || '[]');

        if (history.length === 0) {
            historyList.innerHTML = '<p class="text-center text-muted py-4">No translation history yet.</p>';
            return;
        }

        historyList.innerHTML = '';

        history.forEach(item => {
            const date = new Date(item.timestamp);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const historyItemEl = document.createElement('div');
            historyItemEl.className = 'history-item';
            historyItemEl.innerHTML = `
                <div class="history-item-header">
                    <div class="history-languages">${getLanguageName(item.sourceLang)} → ${getLanguageName(item.targetLang)}</div>
                    <div class="history-timestamp">${formattedDate}</div>
                </div>
                <div class="history-texts">
                    <div class="history-text history-original">${escapeHtml(item.originalText)}</div>
                    <div class="history-text history-translated">${escapeHtml(item.translatedText)}</div>
                </div>
                <div class="history-actions">
                    <button class="btn btn-sm btn-outline-primary history-btn use-translation-btn" data-id="${item.id}">
                        <i class="bi bi-arrow-repeat me-1"></i> Use
                    </button>
                    <button class="btn btn-sm btn-outline-secondary history-btn copy-history-btn" data-id="${item.id}">
                        <i class="bi bi-clipboard me-1"></i> Copy
                    </button>
                    <button class="btn btn-sm btn-outline-danger history-btn delete-history-btn" data-id="${item.id}">
                        <i class="bi bi-trash me-1"></i> Delete
                    </button>
                </div>
            `;

            historyList.appendChild(historyItemEl);
        });

        document.querySelectorAll('.use-translation-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                useTranslation(id);
            });
        });

        document.querySelectorAll('.copy-history-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                copyTranslation(id);
            });
        });

        document.querySelectorAll('.delete-history-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                deleteHistoryItem(id);
            });
        });
    }

    function getLanguageName(langCode) {
        const options = languageSelect.options;
        for (let i = 0; i < options.length; i++) {
            if (options[i].value === langCode) {
                return options[i].textContent;
            }
        }
        return langCode;
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    function useTranslation(id) {
        const history = JSON.parse(localStorage.getItem('polyglottyHistory') || '[]');
        const item = history.find(h => h.id === id);

        if (item) {
            textInput.value = item.originalText;
            outputText.value = item.translatedText;
            detectedLangSpan.innerText = item.sourceLang;
            detectConfidenceSpan.innerText = "";

            const options = languageSelect.options;
            for (let i = 0; i < options.length; i++) {
                if (options[i].value === item.targetLang) {
                    languageSelect.value = item.targetLang;
                    break;
                }
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function copyTranslation(id) {
        const history = JSON.parse(localStorage.getItem('polyglottyHistory') || '[]');
        const item = history.find(h => h.id === id);

        if (item) {
            navigator.clipboard.writeText(item.translatedText)
                .then(() => {
                    copyToast.show();
                })
                .catch(err => {
                    console.error("Failed to copy text: ", err);
                    showErrorToast("Failed to copy text to clipboard.");
                });
        }
    }

    function deleteHistoryItem(id) {
        let history = JSON.parse(localStorage.getItem('polyglottyHistory') || '[]');
        history = history.filter(h => h.id !== id);
        localStorage.setItem('polyglottyHistory', JSON.stringify(history));
        loadHistory();
    }

    function clearHistory() {
        if (confirm('Are you sure you want to clear all translation history?')) {
            localStorage.removeItem('polyglottyHistory');
            loadHistory();
        }
    }

    historyToggle.addEventListener('click', function (e) {
        e.preventDefault();
        historySection.classList.toggle('d-none');
        if (!historySection.classList.contains('d-none')) {
            loadHistory();
        }
    });

    closeHistoryBtn.addEventListener('click', function () {
        historySection.classList.add('d-none');
    });

    clearHistoryBtn.addEventListener('click', clearHistory);

    window.addEventListener('beforeunload', stopSpeech);

    resetSpeechButtons();
    filterLanguages("");
    detectedLangSpan.innerText = "N/A";
});