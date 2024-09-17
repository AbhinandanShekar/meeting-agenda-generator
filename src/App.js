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
        max_tokens: 300,  // Increased token limit
      }),
    });

    const data = await response.json();
    if (data && data.choices && data.choices.length > 0) {
      return {
        subject: topics,
        content: formatAgenda(data.choices[0].message.content.trim()), // Format agenda content
      };
    } else {
      return {
        subject: topics,
        content: "Error generating agenda. Please try again.",
      };
    }
  };

  // Function to format the response with HTML elements
  const formatAgenda = (content) => {
    return content
      .replace(/^•/gm, "<li>")  // Replace bullet points with <li>
      .replace(/\n\n/g, "</li><br/><br/>") // Replace double newlines with paragraph breaks
      .replace(/^(I|II|III|IV|V|VI|VII|VIII|IX|X)\./gm, "<strong>$&</strong>") // Bold headings with Roman numerals
      .replace(/-\s[A-Z]+\./g, "<strong>$&</strong>") // Bold the sub-points
      .replace(/\n/g, "</li><li>");  // Replace remaining single newlines with <li> for line breaks
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
            <p><strong>Meeting Agenda Subject:</strong> {agenda.subject}</p>
            <ul dangerouslySetInnerHTML={{ __html: agenda.content }} /> {/* Dynamically render formatted content */}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

