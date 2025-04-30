import { auth, db } from './firebase-config.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    getDocs,
    doc,
    getDoc,
    deleteDoc,
    onSnapshot,
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// DOM Elements
const userEmailElement = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const expenseForm = document.getElementById('expenseForm');
const expenseList = document.getElementById('expenseList');
const totalSpentElement = document.getElementById('totalSpent');
const monthlyBudgetElement = document.getElementById('monthlyBudget');
const remainingElement = document.getElementById('remaining');
const expenseChart = document.getElementById('expenseChart');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorContainer = document.getElementById('errorContainer');

let currentUser = null;
let chart = null;
let unsubscribeExpenses = null;

// Show/Hide loading indicator
const showLoading = () => loadingIndicator.style.display = 'flex';
const hideLoading = () => loadingIndicator.style.display = 'none';

// Show error message
const showError = (message) => {
    console.error('Error:', message);  // Add console logging for debugging
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
};

// Show success message
const showSuccess = (message) => {
    errorContainer.textContent = message;
    errorContainer.style.color = '#059669';
    errorContainer.style.backgroundColor = '#d1fae5';
    errorContainer.style.borderColor = '#059669';
    errorContainer.style.display = 'block';
    setTimeout(() => {
        errorContainer.style.display = 'none';
        errorContainer.style.color = '#dc2626';
        errorContainer.style.backgroundColor = '#fee2e2';
        errorContainer.style.borderColor = '#ef4444';
    }, 3000);
};

// Validate expense data
function validateExpenseData(data) {
    if (!data.title || data.title.trim().length === 0) {
        throw new Error('Please enter an expense title');
    }
    if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
        throw new Error('Please enter a valid amount');
    }
    if (!data.category) {
        throw new Error('Please select a category');
    }
    if (!data.date) {
        throw new Error('Please select a date');
    }
    return true;
}

// Check authentication state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        userEmailElement.textContent = user.email;
        await initializeDashboard();
    } else {
        if (unsubscribeExpenses) {
            unsubscribeExpenses();
        }
        window.location.href = 'auth.html';
    }
});

// Initialize dashboard
async function initializeDashboard() {
    showLoading();
    try {
        await loadUserData();
        await loadExpenses(); // First load expenses immediately
        setupExpensesListener(); // Then set up real-time updates
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError('Error loading dashboard data. Please refresh the page.');
    } finally {
        hideLoading();
    }
}

// Load user data and settings
async function loadUserData() {
    try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const monthlyBudget = userData.settings?.monthlyBudget || 0;
            monthlyBudgetElement.textContent = formatCurrency(monthlyBudget);
            updateSummary();
        } else {
            // Create user document if it doesn't exist
            await setDoc(doc(db, 'users', currentUser.uid), {
                email: currentUser.email,
                createdAt: serverTimestamp(),
                settings: {
                    currency: 'USD',
                    monthlyBudget: 0
                }
            });
            monthlyBudgetElement.textContent = formatCurrency(0);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showError('Error loading user settings');
        throw error;
    }
}

// Load expenses (initial load)
async function loadExpenses() {
    try {
        console.log('Starting loadExpenses function...'); // Debug log
        const expensesQuery = query(
            collection(db, 'expenses'),
            where('userId', '==', currentUser.uid),
            orderBy('date', 'desc')
        );
        console.log('Current user ID:', currentUser.uid); // Debug log

        try {
            const querySnapshot = await getDocs(expensesQuery);
            console.log('Query snapshot size:', querySnapshot.size); // Debug log
            const expenses = [];
            let totalSpent = 0;

            expenseList.innerHTML = '';

            querySnapshot.forEach((doc) => {
                const expense = { id: doc.id, ...doc.data() };
                console.log('Processing expense:', expense); // Debug log
                expenses.push(expense);
                totalSpent += Number(expense.amount);
                
                const expenseElement = createExpenseElement(expense);
                expenseList.appendChild(expenseElement);
            });

            console.log('Total expenses loaded:', expenses.length); // Debug log
            console.log('Total amount spent:', totalSpent); // Debug log

            totalSpentElement.textContent = formatCurrency(totalSpent);
            updateSummary();
            updateChart(expenses);
        } catch (error) {
            if (error.code === 'failed-precondition' || error.message.includes('index')) {
                console.log('Index is building:', error);
                expenseList.innerHTML = `
                    <div style="text-align: center; padding: 20px; background: #f3f4f6; border-radius: 8px; margin: 10px 0;">
                        <h3 style="color: #1f2937; margin-bottom: 10px;">Setting Up Your Dashboard</h3>
                        <p style="color: #4b5563; margin-bottom: 15px;">We're preparing your expense tracking system. This usually takes 1-2 minutes.</p>
                        <p style="color: #4b5563;">You can still add new expenses. They will appear automatically once setup is complete.</p>
                        <button onclick="window.location.reload()" class="btn btn-primary" style="margin-top: 15px;">Refresh Page</button>
                    </div>
                `;
                // Still allow adding expenses during index building
                showError('Dashboard is being set up. You can still add expenses. Please refresh in a minute.');
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error loading expenses:', error);
        showError('Error loading expenses: ' + error.message);
    }
}

// Setup real-time expenses listener
function setupExpensesListener() {
    if (unsubscribeExpenses) {
        unsubscribeExpenses();
    }

    const expensesQuery = query(
        collection(db, 'expenses'),
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc')
    );

    unsubscribeExpenses = onSnapshot(expensesQuery, (snapshot) => {
        try {
            console.log('Received snapshot update'); // Debug log
            const expenses = [];
            let totalSpent = 0;

            expenseList.innerHTML = '';

            snapshot.forEach((doc) => {
                const expense = { id: doc.id, ...doc.data() };
                console.log('Expense from snapshot:', expense); // Debug log
                expenses.push(expense);
                totalSpent += Number(expense.amount);
                
                const expenseElement = createExpenseElement(expense);
                expenseList.appendChild(expenseElement);
            });

            totalSpentElement.textContent = formatCurrency(totalSpent);
            updateSummary();
            updateChart(expenses);
        } catch (error) {
            if (error.code === 'failed-precondition' || error.message.includes('index')) {
                console.log('Index is still building:', error);
                // Don't show error message here as it's already shown in loadExpenses
            } else {
                console.error('Error in snapshot listener:', error);
                showError('Error updating expenses: ' + error.message);
            }
        }
    }, (error) => {
        if (error.code === 'failed-precondition' || error.message.includes('index')) {
            console.log('Index is still building:', error);
            // Don't show error message here as it's already shown in loadExpenses
        } else {
            console.error('Error in expenses listener:', error);
            showError('Error updating expenses: ' + error.message);
        }
    });
}

// Create expense element
function createExpenseElement(expense) {
    console.log('Creating expense element for:', expense); // Debug log
    
    const div = document.createElement('div');
    div.className = 'expense-item';
    
    const formattedDate = new Date(expense.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    div.innerHTML = `
        <div class="expense-item-info">
            <h4>${expense.title}</h4>
            <p>${expense.category} • ${formattedDate}</p>
        </div>
        <div class="expense-item-amount">
            ${formatCurrency(expense.amount)}
        </div>
        <div class="expense-item-actions">
            <button class="btn btn-outline" onclick="deleteExpense('${expense.id}')">Delete</button>
        </div>
    `;
    return div;
}

// Add new expense
expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoading();

    try {
        const expenseData = {
            title: document.getElementById('expenseTitle').value.trim(),
            amount: Number(document.getElementById('expenseAmount').value),
            category: document.getElementById('expenseCategory').value,
            date: document.getElementById('expenseDate').value,
            userId: currentUser.uid,
            createdAt: serverTimestamp()
        };

        console.log('Submitting expense data:', expenseData); // Debug log

        // Validate expense data
        validateExpenseData(expenseData);

        // Add expense to Firestore
        const docRef = await addDoc(collection(db, 'expenses'), expenseData);
        console.log('Successfully added expense with ID:', docRef.id); // Debug log

        // Reset form and show success message
        expenseForm.reset();
        document.getElementById('expenseDate').valueAsDate = new Date();
        showSuccess('Expense added successfully');
        
        // Force reload expenses
        await loadExpenses();
    } catch (error) {
        console.error('Error adding expense:', error);
        showError(error.message || 'Error adding expense. Please try again.');
    } finally {
        hideLoading();
    }
});

// Delete expense
window.deleteExpense = async (expenseId) => {
    if (!expenseId) {
        console.error('No expense ID provided');
        return;
    }

    if (confirm('Are you sure you want to delete this expense?')) {
        showLoading();
        try {
            await deleteDoc(doc(db, 'expenses', expenseId));
            showSuccess('Expense deleted successfully');
        } catch (error) {
            console.error('Error deleting expense:', error);
            showError('Error deleting expense: ' + error.message);
        } finally {
            hideLoading();
        }
    }
};

// Update summary
function updateSummary() {
    const totalSpent = parseCurrency(totalSpentElement.textContent);
    const monthlyBudget = parseCurrency(monthlyBudgetElement.textContent);
    const remaining = monthlyBudget - totalSpent;
    remainingElement.textContent = formatCurrency(remaining);
    remainingElement.style.color = remaining < 0 ? '#dc2626' : '#059669';
}

// Update chart
function updateChart(expenses) {
    console.log('Starting updateChart with expenses:', expenses); // Debug log
    
    if (!expenses || expenses.length === 0) {
        console.log('No expenses to display in chart'); // Debug log
        if (chart) {
            chart.destroy();
        }
        chart = null;
        return;
    }

    const categoryTotals = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});

    console.log('Category totals:', categoryTotals); // Debug log

    const data = {
        labels: Object.keys(categoryTotals),
        datasets: [{
            data: Object.values(categoryTotals),
            backgroundColor: [
                '#2563eb', '#7c3aed', '#db2777', '#dc2626',
                '#ea580c', '#65a30d', '#0891b2', '#6366f1'
            ]
        }]
    };

    console.log('Chart data:', data); // Debug log

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(expenseChart, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// Handle logout
logoutBtn.addEventListener('click', async () => {
    try {
        if (unsubscribeExpenses) {
            unsubscribeExpenses();
        }
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error signing out:', error);
        showError('Error signing out');
    }
});

// Set default date to today
document.getElementById('expenseDate').valueAsDate = new Date();

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function parseCurrency(str) {
    return parseFloat(str.replace(/[$,]/g, '')) || 0;
} 