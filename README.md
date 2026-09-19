# Darukaa Biodiversity AI

AI-powered biodiversity intelligence platform that analyzes environmental and biodiversity indicators to generate evidence-based recommendations.

## Problem

Environmental conditions are interconnected. Soil health, water availability, climate, land use and biodiversity can influence each other.

This project analyzes these connected indicators and provides actionable biodiversity recommendations.

## Features

- Environmental project creation
- Soil health analysis
- Water stress analysis
- Biodiversity analysis
- Habitat risk analysis
- Multi-metric reasoning
- Conversational AI
- Clarifying questions for incomplete information
- RAG-based knowledge retrieval
- Semantic embeddings
- ChromaDB vector database
- Scientific evidence retrieval
- Evidence-backed recommendations
- Short, medium and long-term recommendations
- Confidence assessment

## Environmental Metrics

- Soil pH
- Organic carbon
- Soil moisture
- Rainfall
- Temperature
- Land use
- Species richness
- Habitat diversity
- Pollution
- Deforestation

## RAG Architecture

Question
↓
Embedding Model
↓
ChromaDB Vector Database
↓
Semantic Retrieval
↓
Scientific Knowledge
↓
Multi-Metric Reasoning
↓
Biodiversity Recommendation

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- Lucide React

### Backend
- Python
- FastAPI

### AI / RAG
- Sentence Transformers
- all-MiniLM-L6-v2
- ChromaDB
- Retrieval-Augmented Generation

## Knowledge Base

The knowledge base contains information about:

- Soil health
- Biodiversity
- Climate and water
- Land use
- Scientific evidence

## Example

### Input

Rainfall: 548 mm  
Soil Moisture: 16%  
Organic Carbon: 0.3%  
Species Richness: 10  
Habitat Diversity: Low  
Land Use: Wheat monoculture

### Recommendation

The system identifies connected environmental pressures and recommends:

- Water conservation
- Cover crops or legume intercropping
- Crop diversification
- Native vegetation patches

## Project Structure

```text
darukaa-biodiversity-ai/
├── backend/
│   ├── server.py
│   ├── rag_search.py
│   └── index_knowledge.py
├── knowledge/
│   ├── soil_health.txt
│   ├── biodiversity.txt
│   ├── climate_water.txt
│   ├── land_use.txt
│   └── scientific_evidence.txt
├── src/
├── README.md
└── package.json