# Construction Bid Management System

An open-source application for streamlining the intake and management of construction bid invitations received via email.

## Features

- **Email Integration**: Connect to Gmail to automatically process bid invitation emails
- **Project Management**: Organize and track construction bid projects
- **Document Management**: Store and categorize PDF documents including plans and specifications
- **PDF Parsing**: Extract and analyze content from specification documents
- **Cost Estimation**: Create detailed cost estimates with line-item breakdowns
- **Proposal Generation**: Generate professional proposals based on estimates

## Tech Stack

- **Backend**: Flask (Python) with SQLite database
- **Frontend**: React with TypeScript
- **Email Integration**: Gmail API with OAuth2
- **PDF Processing**: PyMuPDF, pdfplumber, WeasyPrint

## Documentation

- [Installation Guide](docs/installation_guide.md)
- [User Manual](docs/user_manual.md)
- [Testing Plan](docs/testing_plan.md)
- [Requirements](docs/requirements.md)
- [Technology Stack](docs/tech_stack.md)

## Project Structure

```
bid-management-system/
├── backend/
│   ├── src/
│   │   ├── models/       # Database models
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Helper functions
│   │   └── main.py       # Application entry point
│   ├── storage/          # Document storage
│   ├── venv/             # Python virtual environment
│   └── requirements.txt  # Python dependencies
├── frontend/
│   └── bid-management-app/  # React application
├── docs/                 # Documentation
└── README.md             # Project overview
```

## Installation

See the [Installation Guide](docs/installation_guide.md) for detailed setup instructions.

## Usage

See the [User Manual](docs/user_manual.md) for detailed usage instructions.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
