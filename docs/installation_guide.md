# Installation Guide

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn
- Git
- SQLite (included with Python)

## Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bid-management-system.git
cd bid-management-system
```

2. Set up Python virtual environment:

A Python virtual environment is an isolated environment that allows you to manage project-specific dependencies. This is important because it helps avoid conflicts between different projects and ensures that your project has the correct versions of the libraries it needs, making your setup reproducible.

Navigate to the `backend` directory if you are not already there:
```bash
cd backend
```

To create the virtual environment, use the `python` command that corresponds to your Python 3.8+ installation (as specified in the Prerequisites). If your system's `python` command points to an older Python 2 version, you should use `python3` instead.

```bash
python -m venv venv
# Or, if your 'python' command points to Python 2:
# python3 -m venv venv
```

**Troubleshooting Virtual Environment Setup:**

*   The `venv` module is included with Python 3.3 and later. However, on some Linux distributions (like Debian or Ubuntu), you might need to install it separately. If the command above fails, try running:
    ```bash
    sudo apt-get install python3-venv
    ```
*   If you still encounter issues, ensure Python 3.8 or higher is installed correctly and that its installation directory is added to your system's PATH. You can verify your Python version by running `python --version` or `python3 --version`.

Once the virtual environment is created, you need to activate it. The activation command varies depending on your shell:

*   **Bash/Zsh:**
    ```bash
    source venv/bin/activate
    ```
*   **Fish:**
    ```bash
    source venv/bin/activate.fish
    ```
*   **CMD (Windows Command Prompt):**
    ```bash
    venv\Scripts\activate.bat
    ```
*   **PowerShell (Windows):**
    ```bash
    venv\Scripts\Activate.ps1
    ```
    (Note: If you get an error in PowerShell about script execution being disabled, you may need to set the execution policy for the current session by running: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process`)

You should see the name of the virtual environment (e.g., `(venv)`) prefixed to your command prompt, indicating that the virtual environment is active.

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up Google OAuth credentials:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Gmail API
   - Create OAuth 2.0 credentials
   - Download the credentials as JSON and save as `client_secret.json` in the backend directory

5. Create storage directories:
```bash
mkdir -p storage/projects
```

6. Run the backend server:
```bash
python src/main.py
```

The backend server will start on http://localhost:5000

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend/bid-management-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Update API URL (if needed):
   - Open `src/lib/api.ts`
   - Update the `API_BASE_URL` constant if your backend is running on a different URL

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The frontend application will start on http://localhost:3000

## Docker Setup (Optional)

1. Make sure Docker and Docker Compose are installed on your system

2. Build and start the containers:
```bash
docker-compose up -d
```

The application will be available at http://localhost:3000

## Usage

1. Open the application in your browser
2. Click on "Process Emails" to authenticate with Gmail and start processing bid invitations
3. Create projects manually or from processed emails
4. Upload and manage documents
5. Create estimates and proposals

## Troubleshooting

- If you encounter authentication issues with Gmail, verify that your OAuth credentials are correctly set up and that the Gmail API is enabled
- For database issues, check that the SQLite database file has the correct permissions
- If the frontend cannot connect to the backend, verify that the API URL is correctly configured and that CORS is properly handled
