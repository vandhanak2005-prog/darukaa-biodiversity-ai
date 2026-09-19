import { useState } from "react";
import { getChatResponse } from "./chatbot";
import "./App.css";

function App() {
  const [project, setProject] = useState({
    name: "",
    region: "",
    soilPH: "",
    organicCarbon: "",
    soilMoisture: "",
    rainfall: "",
    temperature: "",
    landUse: "",
    crop: "",
    speciesRichness: "",
    habitatDiversity: "",
    pollution: "",
    deforestation: "",
  });

  const [scores, setScores] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const [chatQuestion, setChatQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const [jsonInput, setJsonInput] = useState(`{
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

  const [jsonError, setJsonError] = useState("");

  // --------------------------------
  // HANDLE FORM INPUT
  // --------------------------------

  const handleChange = (e) => {
    setProject({
      ...project,
      [e.target.name]: e.target.value,
    });
  };

  // --------------------------------
  // CALCULATE SCORES
  // --------------------------------

  const calculateScores = () => {
    let soilHealth = 50;
    let biodiversity = 50;
    let waterStress = 50;
    let habitatRisk = 40;

    const ph = Number(project.soilPH);
    const organicCarbon = Number(project.organicCarbon);
    const moisture = Number(project.soilMoisture);
    const rainfall = Number(project.rainfall);
    const species = Number(project.speciesRichness);

    if (ph >= 6 && ph <= 7.5) {
      soilHealth += 15;
    }

    if (organicCarbon >= 0.5) {
      soilHealth += 15;
    }

    if (moisture >= 30) {
      soilHealth += 10;
    }

    soilHealth = Math.min(100, soilHealth);

    if (species >= 30) {
      biodiversity += 20;
    }

    if (
      String(project.habitatDiversity).toLowerCase() === "high"
    ) {
      biodiversity += 20;
    }

    if (
      String(project.landUse)
        .toLowerCase()
        .includes("monoculture")
    ) {
      biodiversity -= 15;
    }

    biodiversity = Math.max(
      0,
      Math.min(100, biodiversity)
    );

    if (rainfall < 600) {
      waterStress += 20;
    }

    if (moisture < 25) {
      waterStress += 20;
    }

    waterStress = Math.min(100, waterStress);

    if (
      String(project.habitatDiversity).toLowerCase() === "low"
    ) {
      habitatRisk += 20;
    }

    if (
      String(project.deforestation).toLowerCase() === "high"
    ) {
      habitatRisk += 30;
    }

    habitatRisk = Math.min(100, habitatRisk);

    const overall = Math.round(
      (
        soilHealth +
        biodiversity +
        (100 - waterStress) +
        (100 - habitatRisk)
      ) / 4
    );

    return {
      soilHealth,
      biodiversity,
      waterStress,
      habitatRisk,
      overall,
    };
  };

  // --------------------------------
  // GENERATE RECOMMENDATIONS
  // --------------------------------

  const generateRecommendations = () => {
    const generated = [];

    const organicCarbon = Number(project.organicCarbon);
    const moisture = Number(project.soilMoisture);
    const rainfall = Number(project.rainfall);
    const species = Number(project.speciesRichness);

    if (organicCarbon < 0.5 && moisture < 25) {
      generated.push({
        title:
          "Introduce cover crops or legume intercropping",

        why:
          "Low organic carbon and low soil moisture indicate reduced soil resilience. Cover crops and legumes add plant residues and can improve soil structure, biological activity and water retention.",

        metrics:
          "Soil organic carbon, soil moisture, soil biological activity",

        horizon:
          "Medium term: 1–3 years",

        priority: "High",

        evidence:
          "FAO describes soil organic cover and conservation agriculture practices as approaches that can improve soil properties, nutrient cycling, soil structure and biodiversity.",

        source:
          "FAO – Soil Organic Cover, Conservation Agriculture",

        url:
          "https://www.fao.org/conservation-agriculture/in-practice/soil-organic-cover/en/",
      });
    }

    if (
      String(project.landUse)
        .toLowerCase()
        .includes("monoculture") ||
      String(project.habitatDiversity).toLowerCase() === "low"
    ) {
      generated.push({
        title:
          "Increase crop and habitat diversity",

        why:
          "Monoculture and low habitat diversity can provide fewer habitat types and resources for species. Diverse crops, flowering plants, field margins and agroforestry can increase habitat variety.",

        metrics:
          "Species richness, habitat diversity, pollinator resources",

        horizon:
          "Medium to long term: 1–5 years",

        priority: "High",

        evidence:
          "FAO describes intercropping, crop rotations and agroforestry as diversification approaches that can increase biological diversity and support ecosystem functions.",

        source:
          "FAO – The 10 Elements of Agroecology: Diversity",

        url:
          "https://www.fao.org/agroecology/overview/the-10-elements-of-agroecology/diversity/en/",
      });
    }

    if (rainfall < 600 && moisture < 25) {
      generated.push({
        title:
          "Improve water conservation",

        why:
          "Low rainfall combined with low soil moisture indicates high water stress. Mulching, residue retention and improving soil organic matter can help reduce evaporation and improve water availability.",

        metrics:
          "Soil moisture, water availability, soil organic carbon",

        horizon:
          "Short to medium term: Months–3 years",

        priority: "High",

        evidence:
          "FAO explains that soil organic matter affects soil structure, infiltration and moisture-holding capacity.",

        source:
          "FAO – The Importance of Soil Organic Matter",

        url:
          "https://www.fao.org/4/a0100e/a0100e08.htm",
      });
    }

    if (species < 20) {
      generated.push({
        title:
          "Create habitat corridors and native vegetation patches",

        why:
          "Low species richness may indicate limited habitat variety. Native vegetation patches and connected habitat can provide food, shelter and movement opportunities for species.",

        metrics:
          "Species richness, habitat diversity, habitat connectivity",

        horizon:
          "Long term: 2–5 years",

        priority: "Medium",

        evidence:
          "FAO describes crop diversification and flowering vegetation as approaches that can provide resources and connectivity that benefit pollinators.",

        source:
          "FAO – Crop Diversification for Pollinator Conservation",

        url:
          "https://www.fao.org/agroecology/in-action/detail/crop-diversification-for-pollinator-conservation/en",
      });
    }

    return generated;
  };

  // --------------------------------
  // ANALYZE PROJECT
  // --------------------------------

  const analyzeProject = () => {
    const calculatedScores = calculateScores();
    const generatedRecommendations =
      generateRecommendations();

    setScores(calculatedScores);
    setRecommendations(generatedRecommendations);

    // Clear previous conversation when a new project is analyzed
    setChatMessages([]);
  };

  // --------------------------------
  // FORM SUBMIT
  // --------------------------------

  const handleSubmit = (e) => {
    e.preventDefault();
    analyzeProject();
  };

  // --------------------------------
  // IMPORT JSON
  // --------------------------------

  const handleJsonImport = () => {
    try {
      const data = JSON.parse(jsonInput);

      if (!data || typeof data !== "object") {
        setJsonError(
          "JSON must contain an environmental project object."
        );
        return;
      }

      const importedProject = {
        name: data.name || "",
        region: data.region || "",
        soilPH: data.soilPH ?? "",
        organicCarbon: data.organicCarbon ?? "",
        soilMoisture: data.soilMoisture ?? "",
        rainfall: data.rainfall ?? "",
        temperature: data.temperature ?? "",
        landUse: data.landUse || "",
        crop: data.crop || "",
        speciesRichness: data.speciesRichness ?? "",
        habitatDiversity:
          data.habitatDiversity || "",
        pollution: data.pollution || "",
        deforestation:
          data.deforestation || "",
      };

      setProject(importedProject);
      setJsonError("");

      alert(
        "JSON data imported successfully. Now click Analyze Environmental Project."
      );
    } catch (error) {
      setJsonError(
        "Invalid JSON. Please check the format."
      );
    }
  };

  // --------------------------------
  // CHATBOT
  // --------------------------------

  const handleChatSubmit = async (e) => {
    e.preventDefault();

    if (!chatQuestion.trim() || !scores) {
      return;
    }

    const answer = await getChatResponse(
      chatQuestion,
      project,
      chatMessages
    );

    setChatMessages([
      ...chatMessages,
      {
        question: chatQuestion,
        answer: answer,
      },
    ]);

    setChatQuestion("");
  };

  // --------------------------------
  // UI
  // --------------------------------

  return (
    <div className="app">

      <header>
        <h1>🌱 Darukaa Biodiversity AI</h1>

        <p>
          AI-powered environmental intelligence and
          biodiversity recommendations
        </p>
      </header>

      <main>

        {/* JSON INPUT */}

        <div className="card">

          <h2>📦 Structured JSON Input</h2>

          <p>
            Import environmental project data using
            structured JSON.
          </p>

          <textarea
            value={jsonInput}
            onChange={(e) =>
              setJsonInput(e.target.value)
            }
            rows="18"
            style={{
              width: "100%",
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontFamily: "monospace",
              fontSize: "14px",
              marginTop: "10px",
            }}
          />

          <button
            type="button"
            onClick={handleJsonImport}
          >
            📥 Import JSON Data
          </button>

          {jsonError && (
            <p style={{ color: "red" }}>
              {jsonError}
            </p>
          )}

        </div>

        {/* ENVIRONMENTAL PROJECT */}

        <div className="card">

          <h2>Environmental Project</h2>

          <form onSubmit={handleSubmit}>

            <input
              name="name"
              placeholder="Project Name"
              value={project.name}
              onChange={handleChange}
              required
            />

            <input
              name="region"
              placeholder="Region"
              value={project.region}
              onChange={handleChange}
              required
            />

            <input
              name="soilPH"
              type="number"
              step="0.1"
              placeholder="Soil pH"
              value={project.soilPH}
              onChange={handleChange}
              required
            />

            <input
              name="organicCarbon"
              type="number"
              step="0.1"
              placeholder="Organic Carbon (%)"
              value={project.organicCarbon}
              onChange={handleChange}
              required
            />

            <input
              name="soilMoisture"
              type="number"
              placeholder="Soil Moisture (%)"
              value={project.soilMoisture}
              onChange={handleChange}
              required
            />

            <input
              name="rainfall"
              type="number"
              placeholder="Annual Rainfall (mm)"
              value={project.rainfall}
              onChange={handleChange}
              required
            />

            <input
              name="temperature"
              type="number"
              step="0.1"
              placeholder="Temperature (°C)"
              value={project.temperature}
              onChange={handleChange}
              required
            />

            <input
              name="landUse"
              placeholder="Land Use"
              value={project.landUse}
              onChange={handleChange}
              required
            />

            <input
              name="crop"
              placeholder="Crop / Vegetation"
              value={project.crop}
              onChange={handleChange}
              required
            />

            <input
              name="speciesRichness"
              type="number"
              placeholder="Species Richness"
              value={project.speciesRichness}
              onChange={handleChange}
              required
            />

            <input
              name="habitatDiversity"
              placeholder="Habitat Diversity (Low / Medium / High)"
              value={project.habitatDiversity}
              onChange={handleChange}
              required
            />

            <input
              name="pollution"
              placeholder="Pollution Level"
              value={project.pollution}
              onChange={handleChange}
            />

            <input
              name="deforestation"
              placeholder="Deforestation Level"
              value={project.deforestation}
              onChange={handleChange}
            />

            <button type="submit">
              🔍 Analyze Environmental Project
            </button>

          </form>

        </div>

        {/* SCORES */}

        {scores && (
          <div className="card results">

            <h2>📊 Environmental Scores</h2>

            <div className="score-grid">

              <div>
                <h3>🌱 Soil Health</h3>
                <p>{scores.soilHealth}/100</p>
              </div>

              <div>
                <h3>🦋 Biodiversity</h3>
                <p>{scores.biodiversity}/100</p>
              </div>

              <div>
                <h3>💧 Water Stress</h3>
                <p>{scores.waterStress}/100</p>
              </div>

              <div>
                <h3>🌳 Habitat Risk</h3>
                <p>{scores.habitatRisk}/100</p>
              </div>

              <div>
                <h3>🌍 Overall Score</h3>
                <p>{scores.overall}/100</p>
              </div>

            </div>

          </div>
        )}

        {/* RECOMMENDATIONS */}

        {scores && (
          <div className="card">

            <h2>
              💡 Evidence-Based Recommendations
            </h2>

            {recommendations.length === 0 ? (
              <p>
                No specific recommendations were
                generated for the current project
                conditions.
              </p>
            ) : (
              recommendations.map(
                (recommendation, index) => (

                  <div
                    className="recommendation"
                    key={index}
                  >

                    <h3>
                      {index + 1}.{" "}
                      {recommendation.title}
                    </h3>

                    <p>
                      <strong>Why:</strong>{" "}
                      {recommendation.why}
                    </p>

                    <p>
                      <strong>
                        Impacted Metrics:
                      </strong>{" "}
                      {recommendation.metrics}
                    </p>

                    <p>
                      <strong>
                        Time Horizon:
                      </strong>{" "}
                      {recommendation.horizon}
                    </p>

                    <p>
                      <strong>
                        Priority:
                      </strong>{" "}
                      {recommendation.priority}
                    </p>

                    <p>
                      <strong>
                        Scientific Evidence:
                      </strong>{" "}
                      {recommendation.evidence}
                    </p>

                    <p>
                      <strong>
                        Source:
                      </strong>{" "}
                      {recommendation.source}
                    </p>

                    <a
                      href={recommendation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🔗 Open Scientific Source
                    </a>

                  </div>

                )
              )
            )}

          </div>
        )}

        {/* CHATBOT */}

        {scores && (
          <div className="card chatbot">

            <h2>
              🤖 Biodiversity AI Assistant
            </h2>

            <p>
              Ask questions about your environmental
              project, soil, biodiversity, habitat,
              rainfall or water.
            </p>

            <form onSubmit={handleChatSubmit}>

              <input
                type="text"
                placeholder="Ask: How can I improve biodiversity?"
                value={chatQuestion}
                onChange={(e) =>
                  setChatQuestion(e.target.value)
                }
              />

              <button type="submit">
                Ask AI Assistant
              </button>

            </form>

            {chatMessages.map(
              (message, index) => (

                <div
                  className="chat-message"
                  key={index}
                >

                  <p>
                    <strong>You:</strong>{" "}
                    {message.question}
                  </p>

                  <p
                    style={{
                      whiteSpace: "pre-line",
                    }}
                  >
                    <strong>AI:</strong>{" "}
                    {message.answer.text}
                  </p>

                  {message.answer.sourceUrl && (
                    <p>

                      <strong>
                        Source:
                      </strong>{" "}
                      {message.answer.sourceName}

                      <br />

                      <a
                        href={
                          message.answer.sourceUrl
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        🔗 Open Scientific Source
                      </a>

                    </p>
                  )}

                </div>

              )
            )}

          </div>
        )}

      </main>

    </div>
  );
}

export default App;