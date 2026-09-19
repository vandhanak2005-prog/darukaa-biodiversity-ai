import { useState } from "react";

function JsonInput({ onImport }) {
  const [jsonText, setJsonText] = useState(`{
  "name": "Semi-Arid Wheat Farm",
  "region": "Karnataka",
  "soilPH": 6.2,
  "organicCarbon": 0.3,
  "soilMoisture": 16,
  "rainfall": 548,
  "temperature": 29,
  "landUse": "Wheat monoculture",
  "crop": "Wheat",
  "speciesRichness": 10,
  "habitatDiversity": "Low",
  "pollution": "Moderate",
  "deforestation": "Low"
}`);

  const [error, setError] = useState("");

  const handleImport = () => {
    try {
      const data = JSON.parse(jsonText);

      onImport(data);
      setError("");
    } catch (err) {
      setError("Invalid JSON. Please check the format.");
    }
  };

  return (
    <div className="card">
      <h2>📦 Structured JSON Input</h2>

      <p>
        Paste structured environmental project data in JSON format.
      </p>

      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        rows="18"
        style={{
          width: "100%",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontFamily: "monospace",
          fontSize: "14px",
        }}
      />

      <button type="button" onClick={handleImport}>
        Import JSON Data
      </button>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default JsonInput;