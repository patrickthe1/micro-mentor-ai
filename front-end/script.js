// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("challenge-form");
    const userChallengeInput = document.getElementById("user-challenge");
    const adviceOutput = document.getElementById("advice-output");
    const submitButton = document.getElementById("submit-btn");
    const buttonText = submitButton.querySelector(".button-text");
    const spinner = submitButton.querySelector(".spinner");

    // Function to set loading state
    const setLoadingState = (isLoading) => {
        console.log('Setting loading state:', isLoading);
        console.log('Spinner element:', spinner);
        submitButton.disabled = isLoading;
        spinner.classList.toggle("hidden", !isLoading);
        buttonText.style.display = isLoading ? "none" : "inline";
        console.log('Spinner classes after toggle:', spinner.classList.toString());
    };

    // Function to display advice with animation
    const displayAdvice = (text) => {
        console.log('Displaying advice:', text);
        adviceOutput.textContent = text;
        adviceOutput.classList.remove("show");
        // Force a reflow to restart animation
        void adviceOutput.offsetWidth;
        adviceOutput.classList.add("show");
        console.log('Advice output classes:', adviceOutput.classList.toString());
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const challenge = userChallengeInput.value;
        console.log('Form submitted with challenge:', challenge);
        
        // Set loading state
        setLoadingState(true);
        adviceOutput.classList.remove("show");

        try {
            console.log('Sending fetch request...');
            const response = await fetch("http://localhost:5000/api/advice", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ challenge }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            displayAdvice(data.advice);
        } catch (error) {
            displayAdvice("Error fetching advice. Please try again.");
            console.error("Error:", error);
        } finally {
            // Reset loading state
            setLoadingState(false);
        }
    });
});
