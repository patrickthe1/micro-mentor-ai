// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("challenge-form");
    const userChallengeInput = document.getElementById("user-challenge");
    const adviceOutput = document.getElementById("advice-output");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent the default form submission

        const challenge = userChallengeInput.value; // Grab user input
        console.log("Sending challenge:", challenge);
        try {
            const response = await fetch("http://localhost:5000/api/advice", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ challenge }), // Send user input to the backend
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const data = await response.json();
            adviceOutput.textContent = data.advice; // Display the AI-generated advice
        } catch (error) {
            adviceOutput.textContent = "Error fetching advice. Please try again."; // Handle errors
            console.error("Error:", error);
        }
    });
});
