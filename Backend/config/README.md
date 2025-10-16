# MongoDB Configuration

This folder contains MongoDB connection configurations for the Alzheimer Care Dashboard backend.

## Files

### 1. `db.js` (Mongoose Connection)
- Uses Mongoose ODM for MongoDB connection
- Configured for use with the main server
- Reads connection string from `.env` file

### 2. `mongodb.js` (Native MongoDB Driver)
- Uses native MongoDB driver
- Direct connection to MongoDB Atlas
- Can be used for testing connection or custom operations

## Setup Instructions

### Option 1: Update .env File (Recommended)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and update the `MONGO_URI` with your actual MongoDB Atlas connection string:
   ```env
   MONGO_URI=mongodb+srv://admin:alzheimerproject2@finance.nyj8xw4.mongodb.net/alzheimer-care?retryWrites=true&w=majority&appName=finance
   ```

3. Make sure to replace:
   - `admin` - your MongoDB username
   - `alzheimerproject2` - your actual password
   - `finance.nyj8xw4.mongodb.net` - your cluster address
   - `alzheimer-care` - your database name

### Option 2: Edit mongodb.js Directly

If you prefer to test the connection directly, edit `mongodb.js`:

```javascript
const uri = "mongodb+srv://admin:alzheimerproject2@finance.nyj8xw4.mongodb.net/alzheimer-care?retryWrites=true&w=majority&appName=finance";
```

## Testing MongoDB Connection

To test the MongoDB connection independently:

```bash
cd Backend/config
node mongodb.js
```

You should see:
```
✅ Pinged your deployment. You successfully connected to MongoDB!
Connection test successful!
MongoDB connection closed
```

## MongoDB Atlas Setup

If you haven't set up MongoDB Atlas yet:

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Create a database user with username and password
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string from "Connect" > "Connect your application"
7. Replace `<password>` with your actual password
8. Add the database name after the cluster address

## Connection String Format

```
mongodb+srv://<username>:<password>@<cluster-address>/<database-name>?retryWrites=true&w=majority&appName=<app-name>
```

Example:
```
mongodb+srv://admin:mypassword123@cluster0.abc123.mongodb.net/alzheimer-care?retryWrites=true&w=majority&appName=AlzheimerCare
```

## Troubleshooting

### Error: Authentication failed
- Check your username and password
- Ensure password doesn't contain special characters that need URL encoding
- Verify database user has proper permissions

### Error: Connection timeout
- Check if your IP address is whitelisted in MongoDB Atlas
- Verify your internet connection
- Check if firewall is blocking MongoDB ports

### Error: Database not found
- The database will be created automatically when you first insert data
- Make sure the database name in the connection string is correct

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to Git (it's in `.gitignore`)
- Keep your MongoDB credentials secure
- Use strong passwords
- Regularly rotate credentials
- Use IP whitelisting in production
- Enable MongoDB Atlas security features

## Using with the Application

The main server (`server.js`) automatically uses the Mongoose connection from `db.js`. No additional configuration needed once `.env` is set up correctly.

The server will:
1. Try to connect to MongoDB using the `MONGO_URI` from `.env`
2. If connection fails, continue running without database (mock data mode)
3. Log connection status to console

## Database Collections

Once connected, the following collections will be created automatically:
- `users` - User accounts and authentication
- `patients` - Patient information
- `assessments` - Cognitive assessments
- `medications` - Medication records
- `activities` - Daily activities
- `appointments` - Scheduled appointments
