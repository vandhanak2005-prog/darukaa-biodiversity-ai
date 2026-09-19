from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import re

from rag_search import search_knowledge


app = FastAPI(
    title="Darukaa Biodiversity RAG API",
    description="AI-powered biodiversity intelligence and RAG system",
    version="1.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


class QuestionRequest(BaseModel):
    question: str
    project: dict | None = None
    conversation_history: list | None = None


@app.get("/")
def home():
    return {
        "message": "Darukaa Biodiversity RAG API is running",
        "status": "active"
    }


# ---------------------------------
# SAFE NUMBER CONVERSION
# ---------------------------------

def get_number(project, key, default=0):

    value = project.get(key)

    if value is None or value == "":
        return default

    try:
        return float(value)
    except:
        return default


# ---------------------------------
# CHECK WHETHER VALUE EXISTS
# ---------------------------------

def has_value(project, key):

    value = project.get(key)

    if value is None:
        return False

    if isinstance(value, str) and value.strip() == "":
        return False

    return True


# ---------------------------------
# FIND MISSING PROJECT INFORMATION
# ---------------------------------

def get_missing_project_fields(project):

    important_fields = {

        "rainfall": (
            "average annual rainfall",
            "What is the average annual rainfall for this project region?"
        ),

        "soilMoisture": (
            "soil moisture",
            "What is the current soil moisture percentage?"
        ),

        "organicCarbon": (
            "soil organic carbon",
            "What is the soil organic carbon percentage?"
        ),

        "speciesRichness": (
            "species richness",
            "What is the approximate species richness?"
        ),

        "habitatDiversity": (
            "habitat diversity",
            "What is the habitat diversity level (Low, Medium or High)?"
        ),

        "landUse": (
            "land use",
            "What is the current land use or cropping system?"
        )
    }

    missing = []

    for key, details in important_fields.items():

        if not has_value(project, key):

            missing.append(
                {
                    "key": key,
                    "name": details[0],
                    "question": details[1]
                }
            )

    return missing


# ---------------------------------
# MULTI-METRIC ANALYSIS
# ---------------------------------

def analyze_project(project):

    rainfall = get_number(project, "rainfall")
    moisture = get_number(project, "soilMoisture")
    organic_carbon = get_number(project, "organicCarbon")
    species_richness = get_number(project, "speciesRichness")
    temperature = get_number(project, "temperature")
    soil_ph = get_number(project, "soilPH")

    habitat = str(
        project.get("habitatDiversity") or ""
    ).lower()

    land_use = str(
        project.get("landUse") or ""
    ).lower()

    pollution = str(
        project.get("pollution") or ""
    ).lower()

    deforestation = str(
        project.get("deforestation") or ""
    ).lower()

    risks = []
    connections = []

    # ---------------------------------
    # WATER RISK
    # ---------------------------------

    if rainfall > 0 and rainfall < 600:
        risks.append("low rainfall")

    if moisture > 0 and moisture < 25:
        risks.append("low soil moisture")

    if (
        rainfall > 0
        and rainfall < 600
        and moisture > 0
        and moisture < 25
    ):
        connections.append(
            "Low rainfall → Low soil moisture → Water stress"
        )

    # ---------------------------------
    # SOIL RISK
    # ---------------------------------

    if (
        organic_carbon > 0
        and organic_carbon < 0.5
    ):
        risks.append("low soil organic carbon")

    if (
        organic_carbon > 0
        and organic_carbon < 0.5
        and moisture > 0
        and moisture < 25
    ):
        connections.append(
            "Low organic carbon → Lower soil resilience → Low moisture retention"
        )

    # ---------------------------------
    # BIODIVERSITY RISK
    # ---------------------------------

    if (
        species_richness > 0
        and species_richness < 30
    ):
        risks.append("low species richness")

    if habitat == "low":
        risks.append("low habitat diversity")

    if (
        species_richness > 0
        and species_richness < 30
        and habitat == "low"
    ):
        connections.append(
            "Low habitat diversity → Low species richness → Reduced biodiversity support"
        )

    # ---------------------------------
    # LAND USE RISK
    # ---------------------------------

    if "monoculture" in land_use:

        risks.append("monoculture land use")

        connections.append(
            "Monoculture → Lower habitat diversity → Reduced biodiversity support"
        )

    # ---------------------------------
    # HUMAN IMPACT
    # ---------------------------------

    if pollution in ["high", "severe"]:
        risks.append("high pollution")

    if deforestation in ["high", "severe"]:

        risks.append("high deforestation")

        connections.append(
            "Deforestation → Habitat loss → Reduced biodiversity support"
        )

    # ---------------------------------
    # TEMPERATURE
    # ---------------------------------

    if temperature >= 35:
        risks.append("high temperature")

    # ---------------------------------
    # SOIL PH
    # ---------------------------------

    if soil_ph > 0 and (
        soil_ph < 5.5 or soil_ph > 8.0
    ):
        risks.append(
            "soil pH outside the broad suitable range"
        )

    return {
        "risks": risks,
        "connections": connections
    }


# ---------------------------------
# ASK QUESTION
# ---------------------------------

@app.post("/ask")
def ask_question(request: QuestionRequest):

    original_question = request.question

    question = request.question.lower()

    project = request.project or {}

    history = request.conversation_history or []


    # ---------------------------------
    # PROJECT VALUES
    # ---------------------------------

    rainfall = get_number(
        project,
        "rainfall"
    )

    moisture = get_number(
        project,
        "soilMoisture"
    )

    organic_carbon = get_number(
        project,
        "organicCarbon"
    )

    species_richness = get_number(
        project,
        "speciesRichness"
    )


    # ---------------------------------
    # CONVERSATION CONTEXT
    # ---------------------------------

    recent_history = ""

    for message in history[-6:]:

        if not isinstance(message, dict):
            continue

        previous_question = (
            message.get("question")
            or message.get("text")
            or message.get("content")
            or ""
        )

        if previous_question:

            recent_history += (
                " "
                + str(previous_question).lower()
            )


    # ---------------------------------
    # FOLLOW-UP DETECTION
    # ---------------------------------

    follow_up_words = [
        "it",
        "this",
        "that",
        "them",
        "they",
        "those"
    ]

    clean_question_words = re.findall(
        r"\b[a-zA-Z]+\b",
        question
    )

    is_follow_up = any(
        word in clean_question_words
        for word in follow_up_words
    )


    # ---------------------------------
    # FOLLOW-UP CONTEXT
    # ---------------------------------

    if is_follow_up:

        if (
            "water" in recent_history
            or "rainfall" in recent_history
            or "moisture" in recent_history
            or "irrigation" in recent_history
        ):

            question += (
                " water rainfall soil moisture irrigation"
            )

        elif (
            "soil" in recent_history
            or "organic carbon" in recent_history
            or "fertility" in recent_history
        ):

            question += (
                " soil organic carbon fertility"
            )

        elif (
            "biodiversity" in recent_history
            or "species" in recent_history
            or "habitat" in recent_history
            or "pollinator" in recent_history
        ):

            question += (
                " biodiversity species habitat pollinator"
            )


    # ---------------------------------
    # DIRECT PROJECT VALUE QUESTIONS
    # ---------------------------------

    direct_answer = None


    # Rainfall

    if (
        "rainfall" in question
        and (
            "what is" in question
            or "how much" in question
            or "value" in question
            or "current" in question
        )
    ):

        if has_value(project, "rainfall"):

            direct_answer = (
                "Your project's current rainfall is "
                + str(rainfall)
                + " mm."
            )

        else:

            direct_answer = (
                "Rainfall is not provided in the current "
                "project data. What is the average annual "
                "rainfall for this project region?"
            )


    # Soil moisture

    elif (
        "soil moisture" in question
        and (
            "what is" in question
            or "how much" in question
            or "value" in question
            or "current" in question
        )
    ):

        if has_value(project, "soilMoisture"):

            direct_answer = (
                "Your project's current soil moisture is "
                + str(moisture)
                + "%."
            )

        else:

            direct_answer = (
                "Soil moisture is not provided in the current "
                "project data. What is the current soil moisture percentage?"
            )


    # Organic carbon

    elif (
        "organic carbon" in question
        and (
            "what is" in question
            or "how much" in question
            or "value" in question
            or "current" in question
        )
    ):

        if has_value(project, "organicCarbon"):

            direct_answer = (
                "Your project's current organic carbon is "
                + str(organic_carbon)
                + "%."
            )

        else:

            direct_answer = (
                "Soil organic carbon is not provided in the "
                "current project data. What is the soil organic "
                "carbon percentage?"
            )


    # Land use

    elif "land use" in question:

        if has_value(project, "landUse"):

            land_use_value = project.get("landUse")

            direct_answer = (
                "Your project's current land use is "
                + str(land_use_value)
                + "."
            )

        else:

            direct_answer = (
                "Land use is not provided in the current project "
                "data. What is the current land use or cropping system?"
            )


    # Species richness

    elif "species richness" in question:

        if has_value(project, "speciesRichness"):

            direct_answer = (
                "Your project's current species richness is "
                + str(species_richness)
                + "."
            )

        else:

            direct_answer = (
                "Species richness is not provided in the current "
                "project data. What is the approximate species richness?"
            )


    # Habitat diversity

    elif "habitat diversity" in question:

        habitat_value = (
            project.get("habitatDiversity")
        )

        if has_value(project, "habitatDiversity"):

            direct_answer = (
                "Your project's current habitat diversity is "
                + str(habitat_value)
                + "."
            )

        else:

            direct_answer = (
                "Habitat diversity is not provided in the current "
                "project data. What is the habitat diversity level "
                "(Low, Medium or High)?"
            )


    # Temperature

    elif "temperature" in question:

        temperature_value = get_number(
            project,
            "temperature"
        )

        if has_value(project, "temperature"):

            direct_answer = (
                "Your project's current temperature is "
                + str(temperature_value)
                + " °C."
            )

        else:

            direct_answer = (
                "Temperature is not provided in the current "
                "project data. What is the average temperature?"
            )


    # Soil pH

    elif (
        "soil ph" in question
        or "ph of soil" in question
    ):

        ph_value = get_number(
            project,
            "soilPH"
        )

        if has_value(project, "soilPH"):

            direct_answer = (
                "Your project's current soil pH is "
                + str(ph_value)
                + "."
            )

        else:

            direct_answer = (
                "Soil pH is not provided in the current project "
                "data. What is the soil pH?"
            )


    # ---------------------------------
    # CLARIFYING QUESTIONS
    # ---------------------------------

    is_analysis_question = (
        "improve" in question
        or "recommend" in question
        or "analyze" in question
        or "analysis" in question
        or "overall" in question
        or "what should" in question
        or "suggest" in question
    )


    if (
        direct_answer is None
        and is_analysis_question
    ):

        missing_fields = get_missing_project_fields(
            project
        )

        if missing_fields:

            answer = ""

            answer += (
                "CLARIFYING QUESTIONS\n\n"
            )

            answer += (
                "I need a little more project information "
                "before generating a reliable biodiversity "
                "recommendation.\n\n"
            )

            answer += (
                "Please provide:\n\n"
            )

            for index, field in enumerate(
                missing_fields[:3],
                start=1
            ):

                answer += (
                    str(index)
                    + ". "
                    + field["question"]
                    + "\n"
                )

            answer += "\n"

            answer += (
                "These indicators will help me connect "
                "soil, water, land-use and biodiversity "
                "conditions instead of making a recommendation "
                "from incomplete data."
            )

            return {
                "question": original_question,
                "project": project,
                "retrieved_knowledge": [],
                "answer": answer,
                "message": "Clarifying questions generated because important project data is missing."
            }


    # ---------------------------------
    # MULTI-METRIC ANALYSIS
    # ---------------------------------

    analysis = analyze_project(project)

    risks = analysis["risks"]

    connections = analysis["connections"]


    # ---------------------------------
    # RAG RETRIEVAL
    # ---------------------------------

    retrieved_results = search_knowledge(
        question,
        top_k=5
    )

    retrieved = []

    used_sources = set()

    for item in retrieved_results:

        source = item["source"]

        if source in used_sources:
            continue

        used_sources.add(source)

        retrieved.append(
            {
                "source": source,
                "content": item["document"],
                "distance": item["distance"]
            }
        )

        if len(retrieved) >= 3:
            break


    answer = ""


    # ---------------------------------
    # DIRECT ANSWER
    # ---------------------------------

    if direct_answer:

        answer += (
            "PROJECT VALUE\n\n"
        )

        answer += direct_answer

        answer += (
            "\n\nThis value is taken directly from "
            "the structured project data."
        )


    # ---------------------------------
    # MULTI-METRIC INTELLIGENCE
    # ---------------------------------

    elif (
        len(risks) >= 3
        and (
            "improve" in question
            or "recommend" in question
            or "analyze" in question
            or "analysis" in question
            or "overall" in question
            or "project" in question
            or "what should" in question
        )
    ):

        answer += (
            "MULTI-METRIC INTELLIGENCE ANALYSIS\n\n"
        )

        answer += "PROJECT CONDITION\n\n"

        answer += (
            "Rainfall: "
            + str(rainfall)
            + " mm\n"
        )

        answer += (
            "Soil Moisture: "
            + str(moisture)
            + "%\n"
        )

        answer += (
            "Organic Carbon: "
            + str(organic_carbon)
            + "%\n"
        )

        answer += (
            "Species Richness: "
            + str(species_richness)
            + "\n"
        )

        answer += (
            "Habitat Diversity: "
            + (
                project.get("habitatDiversity")
                or "Not provided"
            )
            + "\n"
        )

        answer += (
            "Land Use: "
            + (
                project.get("landUse")
                or "Not provided"
            )
            + "\n\n"
        )

        answer += (
            "MULTI-METRIC FINDING\n\n"
        )

        answer += (
            "The project shows multiple connected "
            "environmental pressures: "
        )

        answer += ", ".join(risks)

        answer += ".\n\n"

        answer += "CONNECTED METRICS\n\n"

        if connections:

            for connection in connections:

                answer += (
                    "• "
                    + connection
                    + "\n"
                )

        else:

            answer += (
                "• Soil → Water → Habitat → Biodiversity\n"
            )

        answer += "\n"

        answer += "RECOMMENDATION\n\n"

        answer += (
            "Use an integrated biodiversity improvement "
            "approach rather than addressing only one metric.\n\n"
        )

        answer += "What to do:\n"

        answer += (
            "• Improve water conservation using mulching "
            "and residue retention.\n"
        )

        answer += (
            "• Introduce suitable cover crops or legume "
            "intercropping.\n"
        )

        answer += (
            "• Increase crop and habitat diversity.\n"
        )

        answer += (
            "• Maintain or create suitable native "
            "vegetation patches where appropriate.\n\n"
        )

        answer += "Why it works:\n"

        answer += (
            "These actions address water availability, "
            "soil condition and habitat diversity together. "
            "Improving these connected conditions can support "
            "greater ecological resilience and biodiversity.\n\n"
        )

        answer += (
            "Impacted Metrics: Soil organic carbon, soil moisture, "
            "water availability, habitat diversity, species richness\n\n"
        )

        answer += "TIME HORIZON\n\n"

        answer += (
            "Short term: Months\n"
            "• Mulching\n"
            "• Residue retention\n\n"
        )

        answer += (
            "Medium term: 1–3 years\n"
            "• Cover crops\n"
            "• Legume intercropping\n"
            "• Crop diversification\n\n"
        )

        answer += (
            "Long term: 3–5 years\n"
            "• Habitat improvement\n"
            "• Native vegetation patches\n"
            "• Improved ecological connectivity\n"
        )

        answer += "\nCONFIDENCE\n\n"

        answer += (
            "Moderate to high data confidence because "
            "multiple project indicators are available "
            "for combined analysis. Scientific effects "
            "can vary with local conditions and management.\n"
        )


    # ---------------------------------
    # WATER INTELLIGENCE
    # ---------------------------------

    elif (
        "water" in question
        or "rainfall" in question
        or "moisture" in question
        or "irrigation" in question
    ):

        answer += (
            "WATER INTELLIGENCE ANALYSIS\n\n"
        )

        answer += "PROJECT CONDITION\n\n"

        answer += (
            "Rainfall is "
            + str(rainfall)
            + " mm and soil moisture is "
            + str(moisture)
            + "%.\n"
        )

        if rainfall < 600 and moisture < 25:

            answer += (
                "Both indicators suggest a significant "
                "water constraint. The organic carbon level "
                "of "
                + str(organic_carbon)
                + "% is also relevant because soil organic "
                "matter can influence soil structure and "
                "water-holding capacity.\n\n"
            )

        else:

            answer += (
                "These indicators should be monitored together "
                "to understand water availability and plant stress.\n\n"
            )

        answer += "RECOMMENDATION\n\n"

        answer += (
            "Improve water conservation.\n\n"
        )

        answer += (
            "What to do: Use mulching, residue retention and "
            "soil-organic-matter improvement practices.\n\n"
        )

        answer += (
            "Why: These practices can help reduce moisture loss "
            "and support soil water availability.\n\n"
        )

        answer += (
            "Impacted Metrics: Soil moisture, water availability, "
            "soil organic carbon\n\n"
        )

        answer += "CONNECTED METRICS\n\n"

        answer += (
            "Rainfall → Soil moisture → Organic carbon → "
            "Biodiversity resilience\n\n"
        )

        answer += "TIME HORIZON\n\n"

        answer += "Short term: Months\n"
        answer += "• Mulching\n"
        answer += "• Residue retention\n\n"

        answer += "Medium term: 1–3 years\n"
        answer += "• Cover crops\n"
        answer += "• Legume intercropping\n"
        answer += "• Soil organic matter improvement\n"


    # ---------------------------------
    # SOIL INTELLIGENCE
    # ---------------------------------

    elif (
        "soil" in question
        or "organic carbon" in question
        or "fertility" in question
    ):

        answer += (
            "SOIL INTELLIGENCE ANALYSIS\n\n"
        )

        answer += "PROJECT CONDITION\n\n"

        answer += (
            "Organic carbon is "
            + str(organic_carbon)
            + "% and soil moisture is "
            + str(moisture)
            + "%.\n\n"
        )

        answer += "RECOMMENDATION\n\n"

        answer += (
            "Improve soil organic matter.\n\n"
        )

        answer += (
            "What to do: Use suitable cover crops, legume "
            "intercropping and residue retention.\n\n"
        )

        answer += (
            "Why: These practices can support soil structure, "
            "biological activity and soil organic matter.\n\n"
        )

        answer += (
            "Impacted Metrics: Soil organic carbon, soil moisture, "
            "soil biological activity\n\n"
        )

        answer += "CONNECTED METRICS\n\n"

        answer += (
            "Organic carbon → Soil structure → Water retention → "
            "Biodiversity\n\n"
        )

        answer += "TIME HORIZON\n\n"

        answer += "Medium term: 1–3 years\n"
        answer += "• Cover crops\n"
        answer += "• Legume intercropping\n"
        answer += "• Residue retention\n"


    # ---------------------------------
    # BIODIVERSITY INTELLIGENCE
    # ---------------------------------

    elif (
        "biodiversity" in question
        or "species" in question
        or "pollinator" in question
        or "habitat" in question
    ):

        answer += (
            "BIODIVERSITY INTELLIGENCE ANALYSIS\n\n"
        )

        answer += "PROJECT CONDITION\n\n"

        answer += (
            "Species richness is "
            + str(species_richness)
            + " and habitat diversity is "
            + (
                project.get("habitatDiversity")
                or "not provided"
            )
            + ".\n"
        )

        answer += (
            "Land use is "
            + (
                project.get("landUse")
                or "not provided"
            )
            + ".\n\n"
        )

        answer += "RECOMMENDATION\n\n"

        answer += (
            "Increase crop and habitat diversity.\n\n"
        )

        answer += (
            "What to do: Introduce diverse crops, flowering "
            "vegetation, native vegetation patches or suitable "
            "agroforestry approaches.\n\n"
        )

        answer += (
            "Why: Greater habitat and vegetation diversity can "
            "provide resources and shelter for species and "
            "pollinators.\n\n"
        )

        answer += (
            "Impacted Metrics: Species richness, habitat diversity, "
            "habitat connectivity\n\n"
        )

        answer += "CONNECTED METRICS\n\n"

        answer += (
            "Land use → Habitat diversity → Species richness → "
            "Pollinator resources\n\n"
        )

        answer += "TIME HORIZON\n\n"

        answer += "Medium to long term: 1–5 years\n"
        answer += "• Crop diversification\n"
        answer += "• Flowering vegetation\n"
        answer += "• Native vegetation patches\n"
        answer += "• Agroforestry\n"


    # ---------------------------------
    # GENERAL
    # ---------------------------------

    else:

        answer += (
            "BIODIVERSITY INTELLIGENCE ANALYSIS\n\n"
        )

        answer += (
            "Your project should be analyzed using soil, "
            "water, land-use and biodiversity indicators together.\n\n"
        )

        answer += (
            "Ask about water, soil, biodiversity, habitat, "
            "rainfall or species to receive a focused analysis.\n"
        )


    # ---------------------------------
    # RAG EVIDENCE
    # ---------------------------------

    answer += "\nRAG EVIDENCE\n\n"

    for index, item in enumerate(
        retrieved,
        start=1
    ):

        clean_text = " ".join(
            item["content"].split()
        )

        answer += (
            str(index)
            + ". "
            + item["source"]
            + "\n"
        )

        # COMPLETE RETRIEVED EVIDENCE
        answer += (
            "Relevant evidence: "
            + clean_text
            + "\n\n"
        )


    answer += (
        "RAG SOURCES USED: "
        + str(len(retrieved))
        + "\n\n"
    )


    # ---------------------------------
    # RAG PIPELINE
    # ---------------------------------

    answer += "RAG PIPELINE\n\n"

    answer += (
        "Question → Embedding → ChromaDB → Retrieved Knowledge → "
        "Scientific Evidence → Multi-Metric Reasoning → "
        "Focused Recommendation"
    )


    # ---------------------------------
    # CONVERSATION CONTEXT
    # ---------------------------------

    if history:

        answer += (
            "\n\nCONVERSATION CONTEXT\n\n"
        )

        for message in history[-3:]:

            if not isinstance(message, dict):
                continue

            previous_question = (
                message.get("question")
                or message.get("text")
                or message.get("content")
                or ""
            )

            if previous_question:

                answer += (
                    "Previous question: "
                    + str(previous_question)
                    + "\n"
                )


    return {
        "question": original_question,
        "project": project,
        "retrieved_knowledge": retrieved,
        "answer": answer,
        "message": "Dynamic multi-metric RAG analysis completed successfully."
    }