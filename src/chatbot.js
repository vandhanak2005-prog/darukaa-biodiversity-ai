export async function getChatResponse(
  question,
  project,
  conversationHistory = []
) {
  try {
    const response = await fetch("https://darukaa-biodiversity-ai-axft.onrender.com/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        question: question,
        project: project,
        conversation_history: conversationHistory
      })
    });


    if (!response.ok) {
      throw new Error(
        "Backend error: " + response.status
      );
    }


    const data = await response.json();


    const retrieved =
      data.retrieved_knowledge || [];


    if (data.answer) {

      return {
        text: data.answer,

        sourceName:
          retrieved.length > 0
            ? retrieved[0].source
            : "Darukaa Environmental Knowledge Base",

        sourceUrl: null,

        retrievedKnowledge: retrieved
      };
    }


    // ---------------------------------
    // FALLBACK ANSWER
    // ---------------------------------

    let answer = "";


    answer +=
      "BIODIVERSITY INTELLIGENCE ANALYSIS\n\n";


    answer += "QUESTION\n";
    answer += question + "\n\n";


    answer += "PROJECT CONTEXT\n\n";


    answer +=
      "Project: " +
      (project.name || "Not provided") +
      "\n";


    answer +=
      "Region: " +
      (project.region || "Not provided") +
      "\n";


    answer +=
      "Soil pH: " +
      (project.soilPH || "Not provided") +
      "\n";


    answer +=
      "Organic Carbon: " +
      (project.organicCarbon || "Not provided") +
      "%\n";


    answer +=
      "Soil Moisture: " +
      (project.soilMoisture || "Not provided") +
      "%\n";


    answer +=
      "Rainfall: " +
      (project.rainfall || "Not provided") +
      " mm\n";


    answer +=
      "Temperature: " +
      (project.temperature || "Not provided") +
      " °C\n";


    answer +=
      "Land Use: " +
      (project.landUse || "Not provided") +
      "\n";


    answer +=
      "Crop: " +
      (project.crop || "Not provided") +
      "\n";


    answer +=
      "Species Richness: " +
      (project.speciesRichness || "Not provided") +
      "\n";


    answer +=
      "Habitat Diversity: " +
      (project.habitatDiversity || "Not provided") +
      "\n";


    answer +=
      "Pollution: " +
      (project.pollution || "Not provided") +
      "\n";


    answer +=
      "Deforestation: " +
      (project.deforestation || "Not provided") +
      "\n\n";


    // ---------------------------------
    // RAG EVIDENCE
    // ---------------------------------

    answer += "RAG EVIDENCE\n\n";


    retrieved.forEach(
      function (item, index) {

        answer +=
          (index + 1) +
          ". " +
          (item.source || "Knowledge Base") +
          "\n";


        const cleanText =
          (item.document || "")
            .replace(/\s+/g, " ")
            .trim();


        answer +=
          "• " +
          cleanText.substring(0, 350) +
          "\n\n";
      }
    );


    // ---------------------------------
    // RAG PIPELINE
    // ---------------------------------

    answer +=
      "RAG PIPELINE\n\n";


    answer +=
      "Question -> Embedding -> ChromaDB -> " +
      "Retrieved Knowledge -> Scientific Evidence -> " +
      "Multi-Metric Reasoning -> Dynamic Recommendation";


    return {

      text: answer,

      sourceName:
        retrieved.length > 0
          ? retrieved[0].source
          : "Darukaa Environmental Knowledge Base",

      sourceUrl: null,

      retrievedKnowledge: retrieved
    };


  } catch (error) {

    console.error(
      "RAG backend error:",
      error
    );


    return {

      text:
        "Unable to connect to the RAG backend.\n\n" +
        "Make sure FastAPI is running with:\n" +
        "uvicorn server:app --reload",

      sourceName:
        "RAG Backend",

      sourceUrl: null,

      retrievedKnowledge: []
    };
  }
}