from pathlib import Path
import chromadb

BACKEND_DIR = Path(__file__).resolve().parent
CHROMA_DIR = BACKEND_DIR / "chroma_db"

client = chromadb.PersistentClient(
    path=str(CHROMA_DIR)
)

collection = client.get_collection(
    name="darukaa_environmental_knowledge"
)


def search_knowledge(question, top_k=3):

    results = collection.query(
        query_texts=[question],
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
                "distance": distance
            }
        )

    return retrieved