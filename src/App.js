import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [highlights, setHiglights] = useState([]);
  const [relatedHighlights, setRelatedHighlights] = useState([]);

  async function fetchAllHighlights() {
    try {
      const response = await fetch("/api/all");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const jsonData = await response.json();
      setHiglights(jsonData);
      console.log(jsonData);
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
          <button onClick={fetchSimilarFunc} className="similar-highlights-button">Similar Highlights</button>
        </div>
      )}
    </div>
  );
}

export default App;
