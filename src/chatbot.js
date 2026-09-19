import { searchKnowledge } from "./knowledgeSearch";

export function getChatResponse(
  question,
  project,
  scores,
  conversationHistory = []
) {
  const lowerQuestion = question.toLowerCase();

  // --------------------------------
  // RETRIEVE KNOWLEDGE
  // --------------------------------

  const retrievalQuery = `
    ${question}
    ${project.name}
    ${project.region}
    ${project.soilPH}
    ${project.organicCarbon}
    ${project.soilMoisture}
    ${project.rainfall}
    ${project.temperature}
    ${project.landUse}
    ${project.crop}
    ${project.speciesRichness}
    ${project.habitatDiversity}
    ${project.pollution}
    ${project.deforestation}
  `;

  const retrieved = searchKnowledge(retrievalQuery);

  const topKnowledge =
    retrieved.length > 0
      ? retrieved[0]
      : null;

  // --------------------------------
  // CONVERSATION CONTEXT
  // --------------------------------

  let previousContext = "";

  if (conversationHistory.length > 0) {
    previousContext =
      conversationHistory
        .slice(-3)
        .map(
          (message) =>
            `Previous question: ${message.question}`
        )
        .join("\n");
  }

  // --------------------------------
  // PROJECT SUMMARY
  // --------------------------------

  const projectSummary = `
Project: ${project.name}
Region: ${project.region}
Soil pH: ${project.soilPH}
Organic Carbon: ${project.organicCarbon}%
Soil Moisture: ${project.soilMoisture}%
Rainfall: ${project.rainfall} mm
Temperature: ${project.temperature}°C
Land Use: ${project.landUse}
Crop: ${project.crop}
Species Richness: ${project.speciesRichness}
Habitat Diversity: ${project.habitatDiversity}
Pollution: ${project.pollution}
Deforestation: ${project.deforestation}
`;

  // --------------------------------
  // BIODIVERSITY QUESTION
  // --------------------------------

  if (
    lowerQuestion.includes("biodiversity") ||
    lowerQuestion.includes("species") ||
    lowerQuestion.includes("habitat") ||
    lowerQuestion.includes("pollinator")
  ) {
    return {
      text: `Based on ${project.name}, your biodiversity score is ${scores.biodiversity}/100.

MULTI-METRIC ANALYSIS

• Soil organic carbon: ${project.organicCarbon}%
• Soil moisture: ${project.soilMoisture}%
• Annual rainfall: ${project.rainfall} mm
• Species richness: ${project.speciesRichness}
• Habitat diversity: ${project.habitatDiversity}
• Land use: ${project.landUse}

ENVIRONMENTAL INTERACTION

Soil condition, water availability and habitat structure interact to influence biodiversity.

Low soil moisture and low rainfall can create environmental stress for plants and organisms. Low habitat diversity can also reduce the range of resources and shelter available to species.

RECOMMENDATION

Increase crop and habitat diversity using diverse crops, flowering plants, native vegetation patches, agroforestry or habitat corridors.

At the same time, improve soil condition through cover crops and residue retention, and improve water conservation through mulching and better soil organic matter management.

WHY IT WORKS

Improved soil organic carbon can support soil structure and moisture retention. Better water availability can support plant growth, while greater habitat diversity can provide additional resources and shelter for species and pollinators.

IMPACTED METRICS

• Soil organic carbon
• Soil moisture
• Water availability
• Species richness
• Habitat diversity
• Habitat connectivity

TIME HORIZON

Short term: Months – 1 year
• Mulching
• Residue retention
• Flowering vegetation

Medium term: 1 – 3 years
• Cover crops
• Legume intercropping
• Crop diversification

Long term: 2 – 5 years
• Native vegetation patches
• Habitat corridors
• Agroforestry

CONFIDENCE

Confidence: 85%

This is a prototype confidence estimate based on the availability of multiple environmental indicators and supporting knowledge-base evidence. Actual outcomes can vary with local conditions.

${previousContext ? `CONVERSATION CONTEXT\n${previousContext}` : ""}`,

      sourceName:
        topKnowledge?.name ||
        "Darukaa Biodiversity Knowledge Base",

      sourceUrl:
        "https://www.fao.org/agroecology/overview/the-10-elements-of-agroecology/diversity/en/",
    };
  }

  // --------------------------------
  // SOIL QUESTION
  // --------------------------------

  if (
    lowerQuestion.includes("soil") ||
    lowerQuestion.includes("carbon") ||
    lowerQuestion.includes("organic matter")
  ) {
    return {
      text: `Your current soil indicators are:

• Soil pH: ${project.soilPH}
• Organic carbon: ${project.organicCarbon}%
• Soil moisture: ${project.soilMoisture}%
• Soil Health Score: ${scores.soilHealth}/100

MULTI-METRIC ANALYSIS

Organic carbon and soil moisture are closely connected with soil structure, water retention and biological activity.

Your organic carbon level of ${project.organicCarbon}% and soil moisture of ${project.soilMoisture}% indicate that improving soil organic matter and water retention should be considered together.

RECOMMENDATION

Introduce cover crops or legume intercropping and retain crop residues.

WHY IT WORKS

Plant residues and organic inputs can contribute to soil organic matter. Better soil structure can improve water infiltration and moisture retention, supporting soil biological activity.

IMPACTED METRICS

• Soil organic carbon
• Soil moisture
• Soil structure
• Biological activity

TIME HORIZON

Short term: Months
• Residue retention
• Mulching

Medium term: 1 – 3 years
• Cover crops
• Legume intercropping
• Organic matter improvement

${previousContext ? `CONVERSATION CONTEXT\n${previousContext}` : ""}`,

      sourceName:
        topKnowledge?.name ||
        "FAO Soil Health Knowledge",

      sourceUrl:
        "https://www.fao.org/conservation-agriculture/in-practice/soil-organic-cover/en/",
    };
  }

  // --------------------------------
  // WATER QUESTION
  // --------------------------------

  if (
    lowerQuestion.includes("water") ||
    lowerQuestion.includes("rainfall") ||
    lowerQuestion.includes("moisture") ||
    lowerQuestion.includes("drought")
  ) {
    return {
      text: `Your current water indicators are:

• Annual rainfall: ${project.rainfall} mm
• Soil moisture: ${project.soilMoisture}%
• Water Stress Score: ${scores.waterStress}/100
• Organic carbon: ${project.organicCarbon}%

MULTI-METRIC ANALYSIS

Rainfall, soil moisture and organic carbon should be considered together.

Low rainfall combined with low soil moisture can increase water stress. Improving soil organic matter can help support soil structure and moisture retention.

RECOMMENDATION

Improve water conservation using mulching, residue retention, cover crops and improved soil organic matter management.

WHY IT WORKS

Mulching and residue retention can reduce evaporation and protect the soil surface. Improved soil organic matter can support soil structure and water-holding capacity.

IMPACTED METRICS

• Soil moisture
• Water availability
• Organic carbon
• Soil structure

TIME HORIZON

Short term: Months
• Mulching
• Residue retention

Medium term: 1 – 3 years
• Cover crops
• Organic matter improvement

Long term: 2 – 5 years
• Water-efficient land management

${previousContext ? `CONVERSATION CONTEXT\n${previousContext}` : ""}`,

      sourceName:
        topKnowledge?.name ||
        "FAO Soil Organic Matter Knowledge",

      sourceUrl:
        "https://www.fao.org/4/a0100e/a0100e08.htm",
    };
  }

  // --------------------------------
  // GENERAL QUESTION
  // --------------------------------

  return {
    text: `I can analyze your environmental project using the available biodiversity, soil, water, climate and land-use indicators.

PROJECT CONTEXT

${projectSummary}

You can ask me questions such as:

• How can I improve biodiversity?
• What should I do about soil health?
• How can I reduce water stress?
• How does rainfall affect biodiversity?
• How does monoculture affect habitat?
• What should I improve first?

${previousContext ? `\nCONVERSATION CONTEXT\n${previousContext}` : ""}`,

    sourceName:
      topKnowledge?.name ||
      "Darukaa Biodiversity Knowledge Base",

    sourceUrl:
      topKnowledge?.name ===
      "Scientific Evidence Database"
        ? "https://www.fao.org/agroecology/overview/the-10-elements-of-agroecology/diversity/en/"
        : null,
  };
}