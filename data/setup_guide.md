# MongoDB Atlas Setup Guide

Follow these steps to set up your MongoDB Atlas cluster for TrendSense.

## 1. Create a MongoDB Atlas Account
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up for a free account.

## 2. Create a New Project
- Once logged in, create a new project named `TrendSense`.

## 3. Deploy a Free Cluster
- Click **"Build a Database"**.
- Choose the **M0 Free Tier**.
- Select a provider (e.g., AWS) and region (e.g., us-east-1).
- Click **"Create"**.

## 4. Set Up Database Access
- Navigate to **"Database Access"** in the sidebar.
- Click **"Add New Database User"**.
- Authentication Method: **Password**.
- Username: `om_data_admin` (or your choice).
- Password: Click **"Autogenerate"** (Save this in your `.env` file).
- Database User Privileges: **Read and write to any database**.
- Click **"Add User"**.

## 5. Set Up Network Access
- Navigate to **"Network Access"** in the sidebar.
- Click **"Add IP Address"**.
- For development, click **"Allow Access From Anywhere"** (0.0.0.0/0).
- For production, restrict this to your server's IP.
- Click **"Confirm"**.

## 6. Get Your Connection String
- Go back to **"Database"** (Clusters view).
- Click **"Connect"** on your cluster.
- Choose **"Drivers"**.
- Driver: **Python**, Version: **3.11 or later**.
- Copy the connection string. It should look like:
  `mongodb+srv://om_data_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

## 7. Update `.env`
Update your `data/.env` file with the connection string (replace `<password>` with your actual password).

```env
MONGO_URI=mongodb+srv://om_data_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/
DB_NAME=trendsense_db
```
