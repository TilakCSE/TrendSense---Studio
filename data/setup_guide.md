# MongoDB Atlas Setup Guide

Follow these steps to set up your MongoDB Atlas cluster for TrendSense. This uses the **M0 Free Tier**, which is perfect for development and student projects.

## 1. Create a MongoDB Atlas Account
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up for a free account.

## 2. Create a New Project & Deploy a Cluster
- Once logged in, create a new project named `TrendSense`.
- Click **"Build a Database"**.
- Choose the **M0 Free Tier**.
- Select a provider (e.g., AWS) and a region close to you.
- Click **"Create"**.

## 3. Set Up Database Access
- Navigate to **"Database Access"** in the sidebar on the left.
- Click **"Add New Database User"**.
- Authentication Method: **Password**.
- Username: `trendsense_admin` (or your choice).
- Password: Click **"Autogenerate Secure Password"** and securely copy it. You will need this for your `.env` file.
- Database User Privileges: **Read and write to any database**.
- Click **"Add User"**.

## 4. Set Up Network Access
- Navigate to **"Network Access"** in the sidebar.
- Click **"Add IP Address"**.
- For development, click **"Allow Access From Anywhere"** (`0.0.0.0/0`).
- Click **"Confirm"**.

## 5. Get Your Connection String
- Go back to **"Database"** (Clusters view).
- Click **"Connect"** on your cluster.
- Choose **"Drivers"**.
- Driver: **Python**, Version: **3.11 or later**.
- Copy the connection string. It should look something like:
  `mongodb+srv://trendsense_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

## 6. Configure Collections (Optional but Recommended)
By default, the Python scripts will create databases and collections automatically when you insert data. However, you can view them in Atlas:
- Click **"Browse Collections"** on your cluster.
- You will see a `trendSenseDB` database created when you run the scripts.
- Inside it, you will notice databases for `historical_youtube` and `live_trends`.

## 7. Update `.env` File
Create a `.env` file (you can copy from `.env.example`) with your connection string.
Place this at the root or within your `data` directory, according to your folder structure.

Replace `<password>` with your actual database user password.

```env
MONGO_URI="mongodb+srv://trendsense_admin:YOUR_ACTUAL_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
DB_NAME="trendSenseDB"
```

> **IMPORTANT**: Make sure **NEVER to hardcode or commit** your `MONGO_URI` to GitHub. It should only live inside your `.env` file!

## 8. Final Verification Checklist
Once your cluster is set up and your scripts are updated, perform these steps to verify your architecture:
- [ ] **Connection Success:** Run your ingestion script (`python data/db_scripts/upload_live.py` or `.venv/Scripts/python data/db_scripts/upload_live.py`) and check for the `Successfully connected to MongoDB` log.
- [ ] **Index Creation:** Look at the MongoDB Atlas UI under **Browse Collections** -> `live_trends` -> **Indexes**. Verify that the `timestamp` index exists.
- [ ] **Document Verification:** In the Atlas UI, verify that the document count matches the expected batch size. (For historical, it should stop at `200000`).
- [ ] **Sample Query Test:** Write a quick test or use the Atlas UI to filter `{ "text": { "$exists": true } }` to ensure your data is perfectly structured.
