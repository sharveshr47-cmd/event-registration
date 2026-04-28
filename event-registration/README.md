# NexEvent - Premium Event Registration Platform

A complete, production-ready frontend web application for online event registration, built to solve the problem of inefficient manual registration processes.

## 🚀 Features Highlights

- **Premium UI/UX**: Built with modern CSS including Glassmorphism, CSS Variables, smooth micro-animations, and a responsive dark-mode aesthetic.
- **Dynamic Event Management**: Real-time updating of available seats. Disables events automatically when full, and warns users when seats are low.
- **Comprehensive Form Validation**: 
  - Real-time feedback for Name, Email, Phone, and Event selections.
  - Number of seats logic checks against available inventory.
  - Prevents submission on invalid input.
- **Simulated Backend (LocalStorage)**: 
  - Stores all registrations seamlessly in the browser's database.
  - Operates exactly like a backend without requiring Node.js setup or external databases.
- **Admin Dashboard**: A protected-style view to monitor total registrations, seats booked, and tabular user data.
- **Data Export**: Built-in functionality to export all registrations to a properly formatted CSV file for Excel/Sheets.

## 💻 Tech Stack
- **HTML5**: Semantic and accessible DOM structure.
- **CSS3**: Flexbox, CSS Grid, Custom Properties (Variables), Keyframe Animations.
- **Vanilla JavaScript (ES6+)**: Module-like patterns, LocalStorage API, DOM manipulation.

## 🛠️ How to Run
This project was designed to be instantly usable without any complex backend setup.
1. Open the `event-registration` folder.
2. Double-click on `index.html` to open it in Google Chrome, Firefox, Safari, or Edge.
3. No `npm install`, databases, or server configurations are needed! The application will run flawlessly and persist data using your browser's local storage.

## 📁 Project Structure
```
event-registration/
│
├── index.html       # The main entry point containing both form and admin markup.
├── style.css        # Contains all styling, animations, and responsive media queries.
├── script.js        # Core logic, validation, LocalStorage integration, and DOM updates.
└── README.md        # Documentation and run instructions.
```

## 🧪 Testing Data
For testing purposes, the initial events are configured as follows:
- **Global Tech Summit 2026**: 150 Seats (Normal behavior)
- **UI/UX Masterclass**: 8 Seats (Triggers "Low seats" warning UI)
- **AI Engineering Workshop**: 0 Seats (Triggers "Sold Out" state, prevents selection)

Use the **"Reset Data"** button in the Admin Dashboard at any time to clear the LocalStorage database and return to this initial state.
