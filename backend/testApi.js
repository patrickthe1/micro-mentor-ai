import axios from "axios";

const testApi = async () => {
    const url = "http://localhost:5000/api/advice"; // Adjust the URL if your server runs on a different port
    const challenge = "I need help with time management."; // Sample challenge

    try {
        const response = await axios.post(url,{challenge});
        console.log("Response from API:", response.data);
    } catch (error) {
        console.error("Error calling API:", error.response ? error.response.data : error.message);
    }
};

testApi(); 