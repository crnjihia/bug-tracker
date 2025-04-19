# Bug Tracker System

## Project Overview

A full-stack web application for tracking software bugs throughout the development lifecycle. Developed as part of our Software Configuration Management course requirements, demonstrating version control, collaborative development, and deployment practices.

## Key Features

- User authentication (login/registration)
- CRUD operations for bug reports
- Status workflow (Open → In Progress → Resolved)
- Priority classification (High/Medium/Low)
- Comment system for collaboration
- Responsive Material-UI interface

## Technology Stack

| Component       | Technology        |
| --------------- | ----------------- |
| Frontend        | React.js + Vite   |
| UI Framework    | Material-UI       |
| Backend         | Node.js + Express |
| Database        | SQLite            |
| Version Control | Git               |

**Developed for:** SFE 4015 - Software Configuration Management  
**University:** United States International University-Africa (USIU-A)

## Installation Guide

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/bug-tracker.git
cd bug-tracker
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file:

```bash
cp .env.example .env
```

Start the backend:

```bash
node index.js
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```

Start the frontend:

```bash
npm run dev
```

### 4. Access the Application

Open your browser to:  
[http://localhost:5173](http://localhost:5173)

## Database Initialization

The SQLite database will be automatically created with these tables:

- `users` - User accounts
- `bugs` - Bug reports
- `comments` - Discussion threads

To manually inspect the database:

```bash
sqlite3 server/database.db
.tables
.schema users
.quit
```

## Configuration Management Highlights

1. **Git Workflow**:

   - Feature branch workflow
   - Semantic commit messages
   - Pull request reviews

2. **Project Structure**:

   ```
   /client       # Frontend code
   /server       # Backend code
   /.github      # CI/CD workflows
   ```

3. **Dependency Management**:
   - Package version pinning
   - Separate dev/prod dependencies

## Team Contributions

1. Esther Waikwa
2. Christopher Njihia
3. Peter Njoroge

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- Professor [Name] for SFE 4015 guidance
- USIU-A Computer Science Department
- Material-UI and React communities

```

**To complete your README:**

1. Replace placeholders (`[Your Name]`, `[Role]`, etc.) with actual team information
2. Add a screenshot (name it `screenshot.png` in your root folder)
3. Update the repository URL
4. Add specific professor name
5. Include any additional acknowledgments

**Recommended additions:**
1. Create a `.env.example` file in your server with:
```

JWT_SECRET=your_secret_key_here
DB_PATH=./database.db
PORT=5000

```

2. Add a basic `LICENSE.md` file if needed

Would you like me to:
1. Provide a sample screenshot image?
2. Create a more detailed contribution guide?
3. Add specific SCM (Software Configuration Management) terminology from your course?
4. Include UML diagrams or architecture documentation?
```
