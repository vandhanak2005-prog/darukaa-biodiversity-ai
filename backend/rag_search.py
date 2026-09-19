from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer


# -----------------------------
# Paths
# -----------------------------

BACKEND_DIR = Path(__file__).resolve().parent
CHROMA_DIR = BACKEND_DIR / "chroma_db"


# -----------------------------
# Load embedding model
# -----------------------------

model = SentenceTransformer("all-MiniLM-L6-v2")


# -----------------------------
# Connect to ChromaDB
# -----------------------------

client = chromadb.PersistentClient(
    path=str(CHROMA_DIR)
)

collection = client.get_collection(
    name="darukaa_environmental_knowledge"
)


# -----------------------------
# Semantic search function
# -----------------------------

def search_knowledge(question, top_k=3):

    query_embedding = model.encode(
        [question]
    ).tolist()[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    retrieved = []

    for document, metadata, distance in zip(
        documents,
        metadatas,
        distances
    ):

        retrieved.append(
            {
                "document": document,
                "source": metadata.get(
                    "source",
                    "Unknown"
                ),
                "chunk": metadata.get(
                    "chunk",
                    0
                ),
                "distance": distance,
            }
        )

    return retrieved


# -----------------------------
# Test
# -----------------------------

if __name__ == "__main__":

    question = input(
        "Ask an environmental question: "
    )

    results = search_knowledge(question)

    print("\n==============================")
    print("SEMANTIC RAG RETRIEVAL")
    print("==============================")

    for index, result in enumerate(
        results,
        start=1
    ):

        print(f"\nResult {index}")
        print(
            f"Source: {result['source']}"
        )
        print(
            f"Distance: {result['distance']}"
        )
        print(
            f"Content:\n{result['document']}"
        )