# SmartTrack - Personal Expense Tracker

SmartTrack is a modern, user-friendly web application for tracking personal expenses. Built with vanilla JavaScript and Firebase, it helps users manage their finances by tracking expenses, visualizing spending patterns, and maintaining budgets.

## Features

- 🔐 **Secure Authentication**: Email/password authentication using Firebase Auth
- 💰 **Expense Management**: Add, view, and delete expenses
- 📊 **Visual Analytics**: View spending patterns through interactive charts
- 💵 **Budget Tracking**: Set and monitor monthly budgets
- 🔄 **Real-time Updates**: Instant updates using Firebase Realtime Database
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- Frontend:
  - HTML5
  - CSS3 (with modern features like Grid and Flexbox)
  - Vanilla JavaScript (ES6+)
  - Chart.js for data visualization

- Backend:
  - Firebase Authentication
  - Firebase Firestore
  - Firebase Security Rules

## Getting Started

### Prerequisites

- A modern web browser
- Node.js (optional, for local development)
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smarttrack.git
   cd smarttrack
   ```

2. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Email/Password authentication
   - Create a Firestore database

3. Configure Firebase:
   - Copy your Firebase configuration from the Firebase Console
   - Update the `firebase-config.js` file with your configuration

4. Set up Firebase Security Rules:
   - Copy the security rules from `firestore.rules` to your Firebase Console
   - Deploy the security rules

5. Run the application:
   - Open `index.html` in your browser
   - For local development, you can use a local server:
     ```bash
     npx http-server
     ```

## Usage

1. **Sign Up/Login**:
   - Create a new account using email and password
   - Or log in with existing credentials

2. **Adding Expenses**:
   - Click "Add New Expense"
   - Enter expense details (title, amount, category, date)
   - Submit to save

3. **Viewing Expenses**:
   - See all expenses listed chronologically
   - View total spending and budget status
   - Analyze spending patterns through charts

4. **Managing Expenses**:
   - Delete unwanted expenses
   - Track spending by category
   - Monitor monthly budget

## Project Structure

```
smarttrack/
├── css/
│   └── style.css
├── js/
│   ├── firebase-config.js
│   ├── auth.js
│   └── dashboard.js
├── index.html
├── auth.html
├── dashboard.html
├── README.md
└── firestore.rules
```

## Security

- Firebase Authentication ensures secure user access
- Firestore security rules protect user data
- Client-side validation prevents invalid data entry
- Server-side validation ensures data integrity

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Firebase team for the excellent documentation
- Chart.js for the visualization library
- The open-source community for inspiration and resources

## Contact

Your Name - [your.email@example.com](mailto:your.email@example.com)

Project Link: [https://github.com/yourusername/smarttrack](https://github.com/yourusername/smarttrack)

---

Made with ❤️ by [Your Name] 