# Micro-Mentor AI Project - Cursor AI Guidelines

## Project Overview
Micro-Mentor AI is a web application that provides AI-generated advice to young professionals. The app is currently a basic HTML/CSS/JS application with a Node.js/Express backend using the Gemini API. We're converting the frontend to React and Tailwind CSS based on a UI design from V0.

## Current Status
- Basic HTML/CSS/JS frontend hosted on Netlify (micro-mentor.netlify.app) but i also have it locally on my computer 
- Node.js/Express backend hosted on Render again, i have it locally on my computer 
- Simple request-response flow (user submits challenge → backend fetches advice from Gemini API)

## Development Goals
- Follow the [# MICRO-MENTOR AI: COMPREHENSIVE DEVELOPMENT ROADMAP](Roadmap.md) to complete this project


## Developer Experience Level
- New to React and Tailwind CSS and overall building full scale applications
- Needs detailed step-by-step guidance
- Requires explanation of concepts and code

## Guidelines for Cursor AI
1. Provide detailed, step-by-step instructions with full code examples
2. Explain what each piece of code does and why it's needed
3. Include comments in code to explain functionality
4. Break down complex tasks into smaller, manageable steps
5. Address warnings and errors with explanations and solutions
6. Provide context on React/Tailwind concepts as needed
7. Reference this file when providing assistance
8.Feel free to respectfully reject a prompt if it doesn't align with the phases in  [# MICRO-MENTOR AI: COMPREHENSIVE DEVELOPMENT ROADMAP](Roadmap.md)

## Backend Integration
The backend API is at https://micro-mentor-ai.onrender.com and has the following endpoints:
- POST /api/advice - Accepts a challenge string and returns advice

## File Structure Reference
React components should follow this structure:
- src/
  - components/ (reusable UI components)
  - pages/ (full page components)
  - services/ (API calls)
  - utils/ (helper functions)
  - App.js (main component)
  - index.js (entry point)

  # Additional Guidelines for Cursor AI

## Best Practices to Follow
1. Always use version control (Git) and commit changes regularly with meaningful commit messages
2. Follow the principle of separation of concerns (each component/function does one thing well)
3. Use proper error handling for all asynchronous operations
4. Include helpful comments in code for learning purposes
5. Create reusable components rather than duplicating code
6. Follow React's functional component patterns with hooks
7. Maintain consistent code style and formatting
8. Consider accessibility in UI components (proper contrast, semantic HTML)
9. Optimize performance where reasonable (prevent unnecessary re-renders)
10. Ensure responsive design works on different screen sizes

### These guidelines should be applied to all code generated, as would be done by an experienced senior engineer.