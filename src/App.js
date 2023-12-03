import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [highlights, setHiglights] = useState([]);
  const [relatedHighlights, setRelatedHighlights] = useState([]);
  const [hasFetchedHighlights, setHasFetchedHighlights] = useState(false);
  const [apiKey, setApiKey] = useState("");

  function loadReadwiseHighlights() {
    const url = "/api/fetch";

    const requestBody = {
      readwiseApiKey: apiKey,
    };

    // Make the POST request
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Handle the response data
        console.log("Success:", data);
        fetchAllHighlights();
      })
      .catch((error) => {
        // Handle errors
        console.error("Error:", error);
      });
  }

  async function fetchAllHighlights() {
    try {
      const response = await fetch("/api/all");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const jsonData = await response.json();
      setHiglights(jsonData);
      setHasFetchedHighlights(true);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  }

  async function fetchRelatedHighlights(id) {
    try {
      const response = await fetch(`/api/similar?highlightId=${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const jsonData = await response.json();
      setRelatedHighlights(jsonData);
      console.log(jsonData);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  }

  useEffect(() => {
    fetchAllHighlights();
  }, []);

  if (hasFetchedHighlights && highlights.length === 0) {
    return (
      <div>
        <h1>Explorer</h1>
        <div>
          <input
            type="text"
            placeholder="Enter your Readwise API Key"
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button onClick={() => loadReadwiseHighlights()}>
            Fetch my Highlights
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class="flex-container">
      <div class="flex-column">
        <h2>My Highlights</h2>
        {highlights.map((highlight) => (
          <Highlight
            text={highlight.text}
            id={highlight.id}
            fetchSimilarFunc={() => fetchRelatedHighlights(highlight.id)}
          />
        ))}
      </div>

      <div class="flex-column">
        <h2>Related</h2>
        {relatedHighlights.map((highlight) => (
          <Highlight
            text={highlight.text}
            id={highlight.id}
            fetchSimilarFunc={() => fetchRelatedHighlights(highlight.id)}
            hideSimilarButton={true}
          />
        ))}
      </div>
    </div>
  );
}

function Highlight({ text, id, fetchSimilarFunc, hideSimilarButton = false }) {
  return (
    <div className="highlight">
      <div>{text}</div>
      {hideSimilarButton ? null : (
        <div>
          <button
            onClick={fetchSimilarFunc}
            className="similar-highlights-button"
          >
            Similar Highlights
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
