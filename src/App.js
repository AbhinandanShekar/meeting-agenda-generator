import React, { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader"; // Import spinner
import './App.css';

function App() {
  const [topics, setTopics] = useState(""); 
  const [agenda, setAgenda] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // New state for error message

  const handleInputChange = (e) => {
    setTopics(e.target.value);
    if (e.target.value.trim()) {
      setErrorMessage(""); // Clear error if input is not empty
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topics.trim()) { // Check if input is empty or just spaces
      setErrorMessage("Please enter valid meeting topics.");
      return;
    }

    setLoading(true); 

    const generatedAgenda = await getAgendaFromAPI(topics);
    setAgenda(generatedAgenda); 
    setLoading(false); 
  };

  const getAgendaFromAPI = async (topics) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates meeting agendas.",
          },
          {
            role: "user",
            content: `Generate a professional meeting agenda for the following topics:\n\n${topics}`,
          },
        ],
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    if (data && data.choices && data.choices.length > 0) {
      return {
        subject: topics,
        purpose: "AI in Supply Chain & Logistics", // Example, replace with real data
        content: data.choices[0].message.content.trim(),
      };
    } else {
      return {
        subject: topics,
        content: "Error generating agenda. Please try again.",
      };
    }
  };

  return (
    <div className="App">
      <h1>Meeting Agenda Generator</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={topics}
          onChange={handleInputChange}
          placeholder="Enter meeting topics..."
          rows="5"
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Agenda"}
        </button>
      </form>

      {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message */}

      {loading && (
        <div className="spinner-container">
          <ClipLoader color="#007bff" loading={loading} size={50} />
        </div>
      )}

      {agenda && (
        <div className="agenda">
          <h2>Generated Agenda:</h2>
          <div className="agenda-content">
            <ul>
              <li><strong>Meeting Agenda Subject:</strong> {agenda.subject}</li>
              <li>
                <strong>1. Opening:</strong>
                <ul>
                  <li>Call to Order</li>
                  <li>Purpose of the Meeting: {agenda.purpose}</li>
                </ul>
              </li>
              <li><strong>2. Welcome Note & Introduction</strong></li>
              <li>
                <strong>3. Updates & Old Business:</strong>
                <ul>
                  <li>Review and Approval of Previous Meeting Minutes</li>
                  <li>Progress since Last Meeting</li>
                  <li>Follow-ups & Outstanding tasks</li>
                </ul>
              </li>
              <li>
                <strong>4. Presentation:</strong>
                <ul>
                  <li><strong>AI in Supply Chain & Logistics</strong></li>
                  <li>
                    <ul style={{ listStyleType: "circle", marginLeft: "20px" }}>
                      <li>Introduction to AI: What it is and its relevance in the modern world</li>
                      <li>AI impact on Supply Chain and logistics (with case studies)</li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
