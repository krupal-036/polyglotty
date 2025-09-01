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

    window.addEventListener('beforeunload', stopSpeech);

    resetSpeechButtons();
    filterLanguages("");
    detectedLangSpan.innerText = "N/A";

});