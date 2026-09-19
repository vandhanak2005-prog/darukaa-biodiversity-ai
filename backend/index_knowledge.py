from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer


BASE_DIR = Path(__file__).resolve().parent.parent
KNOWLEDGE_DIR = BASE_DIR / "knowledge"
CHROMA_DIR = Path(__file__).resolve().parent / "chroma_db"


print("Loading embedding model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

print("Embedding model loaded.")


client = chromadb.PersistentClient(
    path=str(CHROMA_DIR)
)


collection = client.get_or_create_collection(
    name="darukaa_environmental_knowledge"
)


documents = []
metadatas = []
ids = []


knowledge_files = list(
    KNOWLEDGE_DIR.glob("*.txt")
)


print(
    "Found "
    + str(len(knowledge_files))
    + " knowledge files."
)


for file_path in knowledge_files:

    text = file_path.read_text(
        encoding="utf-8"
    ).strip()

    if not text:
        continue


    # Scientific evidence gets split by evidence record
    if file_path.name == "scientific_evidence.txt":

        records = text.split(
            "SCIENTIFIC EVIDENCE "
        )

        record_number = 0

        for record in records:

            record = record.strip()

            if not record:
                continue

            record_number += 1

            document = (
                "SCIENTIFIC EVIDENCE "
                + record
            )

            documents.append(document)

            metadatas.append(
                {
                    "source": file_path.name,
                    "chunk": record_number,
                    "type": "scientific_evidence"
                }
            )

            ids.append(
                file_path.stem
                + "-"
                + str(record_number)
            )

    else:

        # Other knowledge files use smaller chunks
        chunks = [
            text[i:i + 1000]
            for i in range(
                0,
                len(text),
                1000
            )
        ]

        for index, chunk in enumerate(chunks):

            documents.append(chunk)

            metadatas.append(
                {
                    "source": file_path.name,
                    "chunk": index,
                    "type": "knowledge"
                }
            )

            ids.append(
                file_path.stem
                + "-"
                + str(index)
            )


print(
    "Creating embeddings for "
    + str(len(documents))
    + " documents..."
)


embeddings = model.encode(
    documents
).tolist()


collection.upsert(
    ids=ids,
    documents=documents,
    embeddings=embeddings,
    metadatas=metadatas
)


print()
print("====================================")
print("RAG KNOWLEDGE INDEX CREATED")
print("====================================")
print(
    "Documents indexed: "
    + str(len(documents))
)
print(
    "Vector database: "
    + str(CHROMA_DIR)
)
print(
    "Embedding model: all-MiniLM-L6-v2"
)
print("====================================")