import os
import time
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_community.vectorstores import FAISS

os.environ['OPENAI_API_KEY'] = "XXXXXXXXXXXXXXXXXXXXXXXX"

vectorstore_path = "skygrid_vectorstore"

print("Running VectorDB test...")

try:
    # Check if OPENAI_API_KEY is set
    if "OPENAI_API_KEY" not in os.environ:
        raise ValueError("OPENAI_API_KEY environment variable is not set")

    # Load the document
    print("Loading document...")
    loader = TextLoader("skygrid_info.txt")
    documents = loader.load()
    print(f"Document loaded successfully. Length: {len(documents)} characters")

    # Split the text into chunks
    print("Splitting text into chunks...")
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)  # Reduced chunk size
    texts = text_splitter.split_documents(documents)
    print(f"Text split into {len(texts)} chunks successfully.")

    # Initialize the OpenAI embeddings
    print("Initializing OpenAI embeddings...")
    embeddings = OpenAIEmbeddings()
    print("OpenAI embeddings initialized successfully.")

    # Check if the vectorstore already exists
    if os.path.exists(vectorstore_path):
        print("Loading existing FAISS vector store from disk...")
        vectorstore = FAISS.save_local(vectorstore_path)
        print("Vector store loaded successfully from disk.")
    else:
        print("Creating new FAISS vector store...")
        vectorstore = FAISS.from_documents(texts, embeddings)
        print("Vector store created successfully.")
        
        # Save the FAISS vectorstore to disk
        print("Saving FAISS vector store to disk...")
        vectorstore.save_local(vectorstore_path)
        print("Vector store saved successfully.")

    # Example of searching the vector store
    print("Performing similarity search...")
    query = "What is NimbusEnterprise?"
    docs = vectorstore.similarity_search(query)

    print("Search results:")
    # Print the relevant documents
    for doc in docs:
        print(doc.page_content)

except FileNotFoundError as e:
    print(f"Error: The file 'skygrid_info.txt' was not found. Please check the file path.")
except ValueError as e:
    print(f"Error: {e}")
except TimeoutError as e:
    print(f"Error: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
    import traceback
    traceback.print_exc()

print("VectorDB test completed.")