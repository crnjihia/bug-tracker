# Bug Tracker Web Application

## Project Overview

This Bug Tracker application allows users to report, track, and manage bugs efficiently. It is built as a full-stack web application with **Django** as the backend and **React** for the frontend.

The application supports creating bug reports, viewing them, updating their status, and more. It aims to be a simple yet functional tool for tracking software bugs in development projects.

## Technologies Used

- **Backend**: Django (Python), Django Rest Framework
- **Frontend**: React, Vite, SWC
- **Database**: SQLite (or configure to PostgreSQL for production)
- **Version Control**: Git, GitHub for version management
- **Deployment**: Docker

## Project Setup

### Backend (Django)

1. Navigate to the `/backend` directory.
2. Set up a virtual environment and install dependencies:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On macOS/Linux
   .\venv\Scripts\activate   # On Windows
   pip install -r requirements.txt
   ```
3. Run migrations:
   ```bash
   python manage.py migrate
   ```
4. Start the backend server:
   ```bash
   python manage.py runserver
   ```
   The backend API should now be running at `http://localhost:8000`.

### Frontend (React + Vite)

1. Navigate to the `/frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend server:
   ```bash
   npm run dev
   ```
   The frontend should now be running at `http://localhost:3000`.

## Folder Structure

```
/bug-tracker
    /backend (Django project)
        /bug_tracker (Django app)
        /venv (virtual environment)
        manage.py
        requirements.txt
        /static (optional)
    /frontend (React + Vite project)
        /src
        /public
        /node_modules
        package.json
        index.html
        /components
        /assets
    .gitignore
    README.md
```

## API Endpoints

- `GET /api/bugs/` – Retrieve all bug reports.
- `POST /api/bugs/` – Create a new bug report.
- `GET /api/bugs/{id}/` – Retrieve a specific bug report.
- `PUT /api/bugs/{id}/` – Update a bug report.
- `DELETE /api/bugs/{id}/` – Delete a bug report.

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/crnjihia/bug-tracker.git
   ```

2. Set up the backend:

   - Install Python dependencies: `pip install -r backend/requirements.txt`
   - Run migrations: `python backend/manage.py migrate`
   - Run the Django server: `python backend/manage.py runserver`

3. Set up the frontend:
   - Navigate to the `frontend` folder: `cd frontend`
   - Install frontend dependencies: `npm install`
   - Start the React development server: `npm run dev`

## Testing

### Backend (Django)

- To run tests for Django:
  ```bash
  python manage.py test
  ```

### Frontend (React)

- To run tests for React:
  ```bash
  npm test
  ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors

- **[Christopher Njihia]** - [GitHub Profile](https://github.com/crnjihia)
- **[Esther Waikwa]** - [GitHub Profile](https://github.com/Waikwa0)

## Contributing

Feel free to fork the repository, create issues, and submit pull requests for improvements or bug fixes.

```

---

```
