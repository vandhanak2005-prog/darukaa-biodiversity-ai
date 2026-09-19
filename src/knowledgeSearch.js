import soilHealth from "../knowledge/soil_health.txt?raw";
import biodiversity from "../knowledge/biodiversity.txt?raw";
import climateWater from "../knowledge/climate_water.txt?raw";
import landUse from "../knowledge/land_use.txt?raw";
import scientificEvidence from "../knowledge/scientific_evidence.txt?raw";

const documents = [
  {
    name: "Scientific Evidence Database",
    content: scientificEvidence,
    keywords: [
      "evidence",
      "scientific",
      "study",
      "research",
      "source",
      "fao",
      "recommendation",
      "cover",
      "crop",
      "legume",
      "biodiversity",
      "pollinator",
    ],
  },
  {
    name: "Soil Health Knowledge",
    content: soilHealth,
    keywords: [
      "soil",
      "organic",
      "carbon",
      "moisture",
      "ph",
      "structure",
      "nutrient",
      "cover",
    ],
  },
  {
    name: "Biodiversity Knowledge",
    content: biodiversity,
    keywords: [
      "biodiversity",
      "species",
      "richness",
      "habitat",
      "pollinator",
      "diversity",
    ],
  },
  {
    name: "Climate and Water Knowledge",
    content: climateWater,
    keywords: [
      "climate",
      "rainfall",
      "temperature",
      "water",
      "moisture",
      "drought",
    ],
  },
  {
    name: "Land Use Knowledge",
    content: landUse,
    keywords: [
      "land",
      "landuse",
      "monoculture",
      "agriculture",
      "habitat",
      "fragmentation",
      "agroforestry",
    ],
  },
];

export function searchKnowledge(question) {
  const query = question.toLowerCase();

  const words = query
    .split(/\s+/)
    .map((word) =>
      word.replace(/[^a-z0-9]/g, "")
    )
    .filter((word) => word.length > 2);

  const results = documents
    .map((document) => {
      let score = 0;

      // Match query words against document content
      words.forEach((word) => {
        if (
          document.content
            .toLowerCase()
            .includes(word)
        ) {
          score += 1;
        }
      });

      // Match important environmental keywords
      document.keywords.forEach((keyword) => {
        if (query.includes(keyword)) {
          score += 2;
        }
      });

      return {
        ...document,
        score,
      };
    })
    .filter(
      (document) => document.score > 0
    )
    .sort(
      (a, b) => b.score - a.score
    );

  return results;
}