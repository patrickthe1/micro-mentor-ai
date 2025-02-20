function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add these validation helper functions at the top
function containsRepeatedCharacters(text, threshold = 3) {
    const regex = new RegExp(`(.)\\1{${threshold - 1},}`);
    return regex.test(text);
}

function hasValidWordRatio(text) {
    // Split into words and filter out non-word content
    const words = text.split(/\s+/).filter(word => /^[a-zA-Z]+$/.test(word));
    const totalChars = text.replace(/\s/g, '').length;
    
    // Check if at least 50% of characters form valid words
    return words.join('').length / totalChars >= 0.5;
}

// Add common English words dictionary (just a small sample)
const commonWords = new Set([
    "i", "am", "is", "are", "the", "with", "help", "need", "want", "feel",
    "how", "what", "why", "when", "where", "who", "can", "could", "should",
    "work", "life", "time", "stress", "focus", "anxiety", "depression",
    // ... add more relevant words
]);

function hasEnoughCommonWords(text) {
    const words = text.toLowerCase().split(/\s+/);
    const commonWordCount = words.filter(word => commonWords.has(word)).length;
    return commonWordCount / words.length >= 0.1; // At least 30% should be common words
}

function containsOffensiveContent(text) {
    const offensivePatterns = /\b(hate|kill|death|violent|offensive terms...)\b/i;
    return offensivePatterns.test(text);
}

function isValidChallenge(text) {
    // Convert to lowercase for consistent checking
    const lowerText = text.toLowerCase();
    
    // Check for keyboard smashing patterns
    if (containsRepeatedCharacters(lowerText)) {
        return {
            isValid: false,
            message: "Your challenge contains too many repeated characters. Please rephrase it."
        };
    }

    // Check for random character sequences
    if (!hasValidWordRatio(lowerText)) {
        return {
            isValid: false,
            message: "Your challenge doesn't appear to contain valid words. Please write a clear challenge."
        };
    }

    // Check for minimum word count (e.g., at least 3 words)
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 3) {
        return {
            isValid: false,
            message: "Please describe your challenge in at least 3 words."
        };
    }

    // Add common word validation
    if (!hasEnoughCommonWords(text)) {
        return {
            isValid: false,
            message: "Your challenge is unclear. Please use more common words to describe it."
        };
    }

    // Add offensive content check
    if (containsOffensiveContent(text)) {
        return {
            isValid: false,
            message: "Please rephrase your challenge using more appropriate language."
        };
    }

    return { isValid: true };
}

// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("challenge-form");
    const userChallengeInput = document.getElementById("user-challenge");
    const adviceOutput = document.getElementById("advice-output");
    const submitButton = document.getElementById("submit-btn");
    const buttonText = submitButton.querySelector(".button-text");
    const spinner = submitButton.querySelector(".spinner");

    const MIN_CHALLENGE_LENGTH = 10;
    const MAX_CHALLENGE_LENGTH = 200;

    // Function to set loading state
    const setLoadingState = (isLoading) => {
        submitButton.disabled = isLoading;
        spinner.classList.toggle("hidden", !isLoading);
        buttonText.style.display = isLoading ? "none" : "inline";
    };

    // Function to display advice with animation
    const displayAdvice = (text, isError = false) => {
        adviceOutput.textContent = text;
        adviceOutput.classList.remove("show", "error");
        if (isError) {
            adviceOutput.classList.add("error");
        }
        // Force a reflow to restart animation
        void adviceOutput.offsetWidth;
        adviceOutput.classList.add("show");
    };

    // Function to validate challenge input
    const validateChallenge = (challenge) => {
        if (!challenge) {
            displayAdvice("Please enter a challenge to get advice for.", true);
            return false;
        }
        
        if (challenge.length < MIN_CHALLENGE_LENGTH) {
            displayAdvice(`Please enter at least ${MIN_CHALLENGE_LENGTH} characters to describe your challenge.`, true);
            return false;
        }
        
        if (challenge.length > MAX_CHALLENGE_LENGTH) {
            displayAdvice(`Your challenge description is too long. Please keep it under ${MAX_CHALLENGE_LENGTH} characters.`, true);
            return false;
        }

        // Add natural language validation
        const validationResult = isValidChallenge(challenge);
        if (!validationResult.isValid) {
            displayAdvice(validationResult.message, true);
            return false;
        }

        return true;
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const challenge = userChallengeInput.value.trim();
        
        if (!validateChallenge(challenge)) {
            return;
        }

        setLoadingState(true);
        adviceOutput.classList.remove("show");

        try {
            // First check if we're online
            if (!Navigator.onLine) {
                throw new Error("You appear to be offline. Please check your internet connection.");
            }

            let response;
            try {
                response = await fetch("http://192.168.0.103:5000/api/advice", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ challenge }),
                });
            } catch (fetchError) {
                // This error occurs when the server is unreachable
                throw new Error("Server connection error. Please check if the server is running.");
            }

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                throw new Error("Failed to parse server response. Please try again.");
            }

            if (!response.ok) {
                // This handles errors sent from the server
                throw new Error(data.error || "An error occurred while getting advice. Please try again.");
            }

            displayAdvice(data.advice);
        } catch (error) {
            displayAdvice(error.message, true);
        } finally {
            setLoadingState(false);
        }
    });
});
