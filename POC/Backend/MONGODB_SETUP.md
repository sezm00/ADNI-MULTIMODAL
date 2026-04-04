# MongoDB Atlas Setup Guide

## ⚠️ Authentication Error Fix

You're getting an authentication error because the password in the connection string needs to be corrected.

## Current Issue

The connection string in `config/mongodb.js` has:
```javascript
const uri = "mongodb+srv://admin:<alzheimerproject2>@finance.nyj8xw4.mongodb.net/...";
```

The angle brackets `< >` should NOT be in the actual connection string!

## ✅ How to Fix

### Option 1: Edit mongodb.js directly

Open `Backend/config/mongodb.js` and change line 5 from:
```javascript
const uri = "mongodb+srv://admin:<alzheimerproject2>@finance.nyj8xw4.mongodb.net/?retryWrites=true&w=majority&appName=finance";
```

To (remove the angle brackets):
```javascript
const uri = "mongodb+srv://admin:alzheimerproject2@finance.nyj8xw4.mongodb.net/alzheimer-care?retryWrites=true&w=majority&appName=finance";
```

### Option 2: Use .env file (Recommended)

1. Open or create `Backend/.env` file

2. Add this line (without angle brackets):
```env
MONGO_URI=mongodb+srv://admin:alzheimerproject2@finance.nyj8xw4.mongodb.net/alzheimer-care?retryWrites=true&w=majority&appName=finance
```

3. The server will automatically use this connection string

## 🔐 MongoDB Atlas Checklist

Make sure you've completed these steps in MongoDB Atlas:

### 1. Database User Created
- ✅ Username: `admin`
- ✅ Password: `alzheimerproject2`
- ✅ User has read/write permissions

### 2. Network Access Configured
- ✅ Your IP address is whitelisted, OR
- ✅ Allow access from anywhere (0.0.0.0/0) for development

### 3. Cluster is Running
- ✅ Cluster status is "Active"
- ✅ Cluster name matches the connection string

## 📝 Connection String Format

The correct format is:
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER-ADDRESS/DATABASE-NAME?options
```

Example with your details:
```
mongodb+srv://admin:alzheimerproject2@finance.nyj8xw4.mongodb.net/alzheimer-care?retryWrites=true&w=majority&appName=finance
```

Breaking it down:
- `admin` = your username
- `alzheimerproject2` = your password (NO angle brackets!)
- `finance.nyj8xw4.mongodb.net` = your cluster address
- `alzheimer-care` = database name (will be created automatically)

## 🧪 Testing the Connection

After fixing the connection string, test it:

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

## 🚨 Common Errors

### Error: "bad auth : authentication failed"
**Cause:** Wrong username or password, or angle brackets in the connection string
**Fix:** 
- Remove `< >` from password
- Verify username and password in MongoDB Atlas
- Ensure database user has proper permissions

### Error: "connection timeout"
**Cause:** IP address not whitelisted
**Fix:** 
- Go to MongoDB Atlas → Network Access
- Add your current IP address or use 0.0.0.0/0

### Error: "ENOTFOUND"
**Cause:** Wrong cluster address
**Fix:** 
- Copy the connection string again from MongoDB Atlas
- Verify the cluster address is correct

## 🔄 After Fixing

Once you fix the connection string:

1. **Test the connection:**
   ```bash
   cd Backend/config
   node mongodb.js
   ```

2. **Restart the backend server:**
   - The server will automatically reconnect
   - You should see: `✅ MongoDB Connected Successfully`

3. **Verify in MongoDB Atlas:**
   - Go to your cluster
   - Click "Collections"
   - You should see the `alzheimer-care` database appear after first use

## 📞 Need Help?

If you're still having issues:

1. **Get a fresh connection string from MongoDB Atlas:**
   - Go to your cluster
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password (no brackets!)

2. **Verify your credentials:**
   - Database Access → Check username exists
   - Try resetting the password
   - Ensure user has "Atlas admin" or "Read and write to any database" role

3. **Check Network Access:**
   - Network Access → Add IP Address
   - Use 0.0.0.0/0 for development (allows all IPs)

## ✅ Final Connection String

Your corrected connection string should look exactly like this:

```
mongodb+srv://admin:alzheimerproject2@finance.nyj8xw4.mongodb.net/alzheimer-care?retryWrites=true&w=majority&appName=finance
```

**Remember:** NO angle brackets around the password!
