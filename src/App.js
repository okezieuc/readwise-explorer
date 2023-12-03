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

  useEffect(() => {
    fetchAllHighlights();
  }, []);

  return (
    <div class="flex-container">
      <div class="flex-column">
        <h2>My Highlights</h2>
        {highlights.map((highlight) => (
          <Highlight text={highlight.text} id={highlight.id} />
        ))}
      </div>

      <div class="flex-column">
        <h2>Related</h2>
      </div>
    </div>
  );
}

function Highlight({ text, id }) {
  return <div className="highlight">This: {text}</div>;
}

export default App;
