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

        return true;
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const challenge = userChallengeInput.value.trim();
        
        // Validate before proceeding with API call
        if (!validateChallenge(challenge)) {
            return;
        }

        // If validation passes, proceed with the API call
        setLoadingState(true);
        adviceOutput.classList.remove("show");

        try {
            // First check if we're online
            if (!navigator.onLine) {
                throw new Error("Network error: Please check your internet connection and try again.");
            }

            let response;
            try {
                response = await fetch("http://localhost:5000/api/advice", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ challenge }),
                });
            } catch (fetchError) {
                throw new Error("Network error: Please check your internet connection and try again.");
            }

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                throw new Error("Failed to parse server response. Please try again.");
            }

            if (!response.ok) {
                throw new Error(data.error || "Server error: Failed to get advice. Please try again.");
            }

            displayAdvice(data.advice);
        } catch (error) {
            displayAdvice(error.message || "An unexpected error occurred. Please try again.", true);
        } finally {
            setLoadingState(false);
        }
    });
});
