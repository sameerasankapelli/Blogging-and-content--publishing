# Quick Start Guide

## Running the MERN Blogging Platform

### Step 1: Start the Backend Server

Open a terminal/PowerShell window and run:

```powershell
cd server
npm run dev
```

You should see:
```
Server listening on 5000
MongoDB connected
```

**Keep this terminal running!**

### Step 2: Start the Frontend Client

Open a **NEW** terminal/PowerShell window and run:

```powershell
cd client
npm run dev
```

You should see:
```
  VITE v... ready in ...ms

  ➜  Local:   http://localhost:5173/
```

### Step 3: Open in Browser

Open your browser and navigate to:
```
http://localhost:5173
```

## First Steps

1. **Explore the Landing Page**
   - Beautiful hero section with animated cards
   - Feature highlights and platform stats
   - Click "Get Started Free" to begin

2. **Register an Account**
   - Click "Sign Up" in the navigation or on the landing page
   - Fill in username, email, and password (minimum 6 characters)
   - You'll be automatically redirected to your dashboard

3. **Discover Your Dashboard**
   - View your stats: posts, views, likes, and average engagement
   - Manage all your published posts and drafts
   - Quick actions to create, edit, or delete posts

4. **Create Your First Post**
   - Click "Write" or "New Post" button
   - Enter a captivating title
   - Add tags separated by commas (e.g., "tech,tutorial,beginner")
   - Write content in the Markdown editor with live preview
   - Auto-saves your draft as you type (when logged in)
   - Click "Publish" when ready

5. **Explore the Feed**
   - Browse all published posts with beautiful card layouts
   - Filter by tags with interactive buttons
   - See author avatars, post stats, and publication dates
   - Hover effects and smooth animations throughout

6. **Engage with Content**
   - Click on any post to read the full content
   - Real-time commenting system
   - Like posts to show appreciation
   - View count tracking

## Markdown Examples

```markdown
# Heading 1
## Heading 2

**Bold text** and *italic text*

- Bullet point 1
- Bullet point 2

[Link text](https://example.com)

`code snippet`

\`\`\`javascript
console.log('Code block');
\`\`\`
```

## Troubleshooting

### Server won't start
- Check if MongoDB connection string is correct in `server/.env`
- Ensure port 5000 is not in use

### Client won't start
- Ensure port 5173 is not in use
- Check if `client/.env` has correct API URL

### Can't connect to MongoDB
- Verify your MongoDB Atlas credentials
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure internet connection is stable

## Stopping the Servers

Press `Ctrl+C` in each terminal window to stop the respective server.

## Alternative: Run from Root Directory

Instead of opening two terminals, you can use these commands from the root directory:

**Terminal 1:**
```powershell
npm run server
```

**Terminal 2:**
```powershell
npm run client
```
