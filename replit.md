# Arianalyze - Sentiment Analysis Application

## Overview

Arianalyze is a web-based sentiment analysis application built with Flask that analyzes Indonesian text comments for emotional sentiment. The application features a clean, responsive user interface with Bootstrap 5 styling and provides a simple form-based interaction for users to submit comments and receive sentiment analysis results.

## System Architecture

The application follows a simple monolithic web architecture pattern:

- **Frontend**: HTML templates with Bootstrap 5 CSS framework and vanilla JavaScript
- **Backend**: Flask web framework serving both static content and API endpoints
- **Session Management**: Flask sessions with configurable secret key
- **Development Setup**: Simple Python Flask server with debug mode enabled

The architecture is designed for simplicity and ease of deployment, making it suitable for prototyping and demonstration purposes.

## Key Components

### Backend Components
- **app.py**: Main Flask application with route handlers
- **main.py**: Application entry point and server initialization
- Routes:
  - `/` - Main page serving the sentiment analysis interface
  - `/analyze` (POST) - Handles comment submission and returns mock sentiment results
  - `/login` - Placeholder login page with redirect functionality

### Frontend Components
- **templates/index.html**: Main user interface template with responsive design
- **static/css/style.css**: Custom styling and responsive design rules
- **static/js/script.js**: Client-side interaction handling and form validation
- **UI Features**:
  - Responsive design with Bootstrap 5
  - Auto-resizing textarea for comment input
  - Loading states and form validation
  - Flash message system for user feedback

### Design Patterns
- **MVC Pattern**: Clear separation between templates (views), Flask routes (controllers), and data handling
- **Progressive Enhancement**: JavaScript enhances the basic HTML form functionality
- **Mobile-First Design**: Responsive layout with mobile considerations

## Data Flow

1. **User Input**: User enters comment text in the textarea on the main page
2. **Client-Side Validation**: JavaScript validates input before submission
3. **Form Submission**: POST request sent to `/analyze` endpoint with comment data
4. **Server Processing**: Flask processes the comment and generates mock sentiment result
5. **Response Rendering**: Server renders the same template with results displayed
6. **User Feedback**: Flash messages provide status updates and error handling

Currently implements mock sentiment analysis that always returns "Positif" (Positive) results.

## External Dependencies

### Frontend Dependencies (CDN)
- **Bootstrap 5.3.0**: UI framework for responsive design and components
- **Font Awesome 6.4.0**: Icon library for visual elements

### Backend Dependencies
- **Flask**: Web framework for routing and template rendering
- **Python Standard Library**: OS module for environment variable access

### Environment Variables
- **SESSION_SECRET**: Flask session secret key (defaults to development key)

## Deployment Strategy

The application is configured for simple deployment:

- **Development**: Flask development server on host `0.0.0.0`, port `5000`
- **Debug Mode**: Enabled for development with auto-reload functionality
- **Static Files**: Served directly by Flask for CSS and JavaScript assets
- **Environment Configuration**: Uses environment variables for sensitive configuration

The current setup is optimized for development and demonstration purposes. For production deployment, additional considerations would include:
- WSGI server integration
- Environment-specific configuration
- Static file serving optimization
- Security enhancements

## Changelog

- June 29, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.