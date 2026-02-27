import os
import logging
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from the parent directory of db_scripts
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MongoDBClient:
    """
    Singleton class to manage MongoDB Atlas connection for TrendSense.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBClient, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.uri = os.getenv("MONGO_URI")
        self.db_name = os.getenv("DB_NAME", "trendSenseDB")
        
        if not self.uri:
            logger.error("MONGO_URI not found in .env file.")
            raise ValueError("MONGO_URI not found in .env file")
        
        try:
            self.client = MongoClient(self.uri)
            self.db = self.client[self.db_name]
            # Force a connection check
            self.client.admin.command('ping')
            logger.info(f"Connected to MongoDB: {self.db_name}")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    def get_collection(self, collection_name: str):
        """Returns the specified collection."""
        return self.db[collection_name]

    def close(self):
        """Closes the MongoDB connection."""
        self.client.close()
        logger.info("MongoDB connection closed.")

def get_db():
    """Helper function to get the database instance."""
    return MongoDBClient().db
