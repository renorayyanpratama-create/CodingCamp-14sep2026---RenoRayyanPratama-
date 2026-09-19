// ============================================================================
// Expense & Budget Visualizer Application
// A comprehensive web application for tracking expenses, managing budgets,
// and visualizing financial data with dark/light theme support
// ============================================================================

// Predefined transaction categories
const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Other'];

// ============================================================================
// StorageManager Class
// Handles all localStorage operations with error handling and availability checks
// ============================================================================
class StorageManager {
    // Check if localStorage is available and accessible
    isAvailable() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Save data to localStorage with JSON serialization
    save(key, data) {
        if (!this.isAvailable()) {
            throw new Error('Storage is unavailable');
        }
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
        } catch (e) {
            throw new Error(`Failed to save data: ${e.message}`);
        }
    }

    // Load data from localStorage with JSON deserialization
    load(key) {
        if (!this.isAvailable()) {
            return null;
        }
        try {
            const serializedData = localStorage.getItem(key);
            if (serializedData === null) {
                return null;
            }
            return JSON.parse(serializedData);
        } catch (e) {
            console.error(`Failed to load data for key "${key}":`, e);
            return null;
        }
    }

    // Remove data from localStorage
    remove(key) {
        if (!this.isAvailable()) {
            return;
        }
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error(`Failed to remove data for key "${key}":`, e);
        }
    }
}

// ============================================================================
// TransactionManager Class
// Manages transaction data: creation, deletion, retrieval, and validation
// ============================================================================
class TransactionManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.transactions = [];
        this.storageKey = 'transactions';
        this._loadFromStorage();
    }

    // Load transactions from localStorage on initialization
    _loadFromStorage() {
        const storedTransactions = this.storageManager.load(this.storageKey);
        if (storedTransactions && Array.isArray(storedTransactions)) {
            this.transactions = storedTransactions;
        }
    }

    // Save transactions to localStorage
    _saveToStorage() {
        try {
            this.storageManager.save(this.storageKey, this.transactions);
        } catch (e) {
            console.error('Failed to save transactions:', e);
        }
    }

    // Generate a unique transaction ID using timestamp and random string
    _generateId() {
        return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Validate transaction data before adding
    validateTransaction(amount, category, date) {
        const errors = [];

        // Validate amount
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || !isFinite(numericAmount)) {
            errors.push('Amount must be a valid number');
        } else if (numericAmount === 0) {
            errors.push('Amount cannot be zero');
        }

        // Validate category
        if (!category || category.trim() === '') {
            errors.push('Category is required');
        } else if (!CATEGORIES.includes(category)) {
            errors.push('Invalid category selected');
        }

        // Validate date
        if (!date || date.trim() === '') {
            errors.push('Date is required');
        } else {
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) {
                errors.push('Invalid date format');
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    // Add a new transaction
    addTransaction(amount, category, description, date) {
        // Validate transaction data
        const validation = this.validateTransaction(amount, category, date);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        // Create transaction object
        const transaction = {
            id: this._generateId(),
            amount: parseFloat(amount),
            category: category,
            description: description || '',
            date: date,
            timestamp: Date.now()
        };

        // Add to transactions array and save
        this.transactions.push(transaction);
        this._saveToStorage();
        return transaction;
    }

    // Delete a transaction by ID
    deleteTransaction(id) {
        const initialLength = this.transactions.length;
        this.transactions = this.transactions.filter(t => t.id !== id);
        const deleted = this.transactions.length < initialLength;

        if (deleted) {
            this._saveToStorage();
        }
        return deleted;
    }

    // Get all transactions sorted by date (newest first)
    getTransactions() {
        return [...this.transactions].sort((a, b) => b.timestamp - a.timestamp);
    }

    // Get transactions filtered by specific month and year
    getTransactionsByMonth(year, month) {
        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getFullYear() === year &&
                   transactionDate.getMonth() === month;
        });
    }
}

// ============================================================================
// BudgetManager Class
// Manages budget storage, retrieval, and validation
// ============================================================================
class BudgetManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.budget = null;
        this.storageKey = 'budget';
        this._loadFromStorage();
    }

    // Load budget from localStorage on initialization
    _loadFromStorage() {
        const storedBudget = this.storageManager.load(this.storageKey);
        if (storedBudget && typeof storedBudget.amount === 'number') {
            this.budget = storedBudget.amount;
        }
    }

    // Save budget to localStorage
    _saveToStorage() {
        try {
            this.storageManager.save(this.storageKey, { amount: this.budget });
        } catch (e) {
            console.error('Failed to save budget:', e);
        }
    }

    // Validate budget value
    validateBudget(amount) {
        const errors = [];
        const numericAmount = parseFloat(amount);

        if (isNaN(numericAmount) || !isFinite(numericAmount)) {
            errors.push('Budget must be a valid number');
        } else if (numericAmount <= 0) {
            errors.push('Budget must be a positive value');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    // Set the monthly budget
    setBudget(amount) {
        const validation = this.validateBudget(amount);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        this.budget = parseFloat(amount);
        this._saveToStorage();
    }

    // Get the current monthly budget
    getBudget() {
        return this.budget;
    }
}

// ============================================================================
// ChartRenderer Class
// Renders pie chart visualization using HTML5 Canvas API
// Shows expense distribution by category without external libraries
// ============================================================================
class ChartRenderer {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');

        // Category color mapping for pie chart
        this.categoryColors = {
            'Food': '#FF6384',
            'Transport': '#36A2EB',
            'Entertainment': '#FFCE56',
            'Utilities': '#4BC0C0',
            'Other': '#9966FF'
        };
    }

    // Calculate category distribution from transactions
    calculateCategoryDistribution(transactions) {
        // Filter to only expenses (negative amounts)
        const expenses = transactions.filter(t => t.amount < 0);

        if (expenses.length === 0) {
            return new Map();
        }

        // Calculate total by category
        const categoryTotals = {};
        let totalExpenses = 0;

        expenses.forEach(transaction => {
            const category = transaction.category;
            const absAmount = Math.abs(transaction.amount);

            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }

            categoryTotals[category] += absAmount;
            totalExpenses += absAmount;
        });

        // Calculate percentages and build distribution map
        const distribution = new Map();

        for (const category in categoryTotals) {
            const amount = categoryTotals[category];
            const percentage = (amount / totalExpenses) * 100;

            distribution.set(category, {
                amount: amount,
                percentage: percentage,
                color: this.categoryColors[category] || '#CCCCCC'
            });
        }

        return distribution;
    }

    // Render pie chart on canvas
    render(transactions) {
        // Clear canvas first
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate distribution
        const distribution = this.calculateCategoryDistribution(transactions);

        // Show empty state if no expenses
        if (distribution.size === 0) {
            this.clear();
            return;
        }

        // Calculate canvas center and radius
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        // Draw pie slices (start from top, go clockwise)
        let currentAngle = -Math.PI / 2;

        distribution.forEach((data, category) => {
            const sliceAngle = (data.percentage / 100) * 2 * Math.PI;

            // Draw slice
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            this.ctx.closePath();

            // Fill with category color
            this.ctx.fillStyle = data.color;
            this.ctx.fill();

            // Draw border
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Update angle for next slice
            currentAngle += sliceAngle;
        });

        // Draw legend
        this._drawLegend(distribution);
    }

    // Draw legend for pie chart
    _drawLegend(distribution) {
        const legendX = 10;
        let legendY = 10;
        const boxSize = 15;
        const spacing = 5;

        this.ctx.font = '12px Arial';
        this.ctx.textBaseline = 'middle';

        distribution.forEach((data, category) => {
            // Draw color box
            this.ctx.fillStyle = data.color;
            this.ctx.fillRect(legendX, legendY, boxSize, boxSize);

            // Draw category name and percentage
            this.ctx.fillStyle = '#333333';
            this.ctx.fillText(
                `${category}: ${data.percentage.toFixed(1)}%`,
                legendX + boxSize + spacing,
                legendY + boxSize / 2
            );

            legendY += boxSize + spacing + 5;
        });
    }

    // Clear canvas and show empty state
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = '16px Arial';
        this.ctx.fillStyle = '#999999';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            'No expenses to display',
            this.canvas.width / 2,
            this.canvas.height / 2
        );
    }
}

// ============================================================================
// ThemeManager Class
// Manages theme toggling (light/dark mode) and persistence
// ============================================================================
class ThemeManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.currentTheme = 'light';
        this.storageKey = 'theme';
        this._loadFromStorage();
    }

    // Load theme preference from localStorage
    _loadFromStorage() {
        const storedTheme = this.storageManager.load(this.storageKey);
        if (storedTheme === 'light' || storedTheme === 'dark') {
            this.currentTheme = storedTheme;
        } else {
            this.currentTheme = 'light'; // Default to light theme
        }
    }

    // Save theme preference to localStorage
    _saveToStorage() {
        try {
            this.storageManager.save(this.storageKey, this.currentTheme);
        } catch (e) {
            console.error('Failed to save theme preference:', e);
        }
    }

    // Toggle between light and dark themes
    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this._saveToStorage();
        this.applyTheme();
        return this.currentTheme;
    }

    // Set specific theme (light or dark)
    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            throw new Error('Invalid theme. Must be "light" or "dark"');
        }

        this.currentTheme = theme;
        this._saveToStorage();
        this.applyTheme();
    }

    // Get current theme
    getTheme() {
        return this.currentTheme;
    }

    // Apply current theme to DOM
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }
}

// ============================================================================
// SummaryCalculator Class
// Calculates monthly financial summaries: income, expenses, and remaining budget
// ============================================================================
class SummaryCalculator {
    // Filter transactions by specific month and year
    filterByMonth(transactions, year, month) {
        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getFullYear() === year &&
                   transactionDate.getMonth() === month;
        });
    }

    // Calculate monthly financial summary
    calculateSummary(transactions, budget, year, month) {
        const monthTransactions = this.filterByMonth(transactions, year, month);

        let totalIncome = 0;
        let totalExpenses = 0;

        // Calculate totals
        monthTransactions.forEach(transaction => {
            if (transaction.amount > 0) {
                totalIncome += transaction.amount;
            } else {
                totalExpenses += Math.abs(transaction.amount);
            }
        });

        // Calculate remaining budget
        const budgetAmount = budget !== null ? budget : 0;
        const remainingBudget = budgetAmount - totalExpenses;
        const isOverBudget = remainingBudget < 0;

        return {
            totalIncome,
            totalExpenses,
            remainingBudget,
            isOverBudget
        };
    }
}

// ============================================================================
// UIController Class
// Main controller that coordinates all managers and handles UI updates
// ============================================================================
class UIController {
    constructor() {
        // Initialize all managers
        this.storageManager = new StorageManager();
        this.transactionManager = new TransactionManager(this.storageManager);
        this.budgetManager = new BudgetManager(this.storageManager);
        this.summaryCalculator = new SummaryCalculator();
        this.themeManager = new ThemeManager(this.storageManager);
        this.elements = {};
        this.initialized = false;
    }

    // Initialize the application
    init() {
        if (this.initialized) {
            return;
        }

        // Setup
        this._setupDOMReferences();

        // Check storage availability
        if (!this.storageManager.isAvailable()) {
            this._showStorageWarning();
        }

        // Apply saved theme
        this.themeManager.applyTheme();

        // Setup event listeners
        this._setupEventListeners();

        // Set default date to today
        this._setDefaultDate();

        // Initial UI render
        this.updateUI();

        this.initialized = true;
        console.log('Expense & Budget Visualizer initialized successfully');
    }

    // Setup DOM element references
    _setupDOMReferences() {
        // Forms
        this.elements.transactionForm = document.getElementById('transactionForm');
        this.elements.budgetForm = document.getElementById('budgetForm');

        // Transaction form inputs
        this.elements.amountInput = document.getElementById('amount');
        this.elements.categoryInput = document.getElementById('category');
        this.elements.descriptionInput = document.getElementById('description');
        this.elements.dateInput = document.getElementById('date');
        this.elements.transactionFormError = document.getElementById('transactionFormError');

        // Budget form inputs
        this.elements.budgetInput = document.getElementById('budget');
        this.elements.budgetFormError = document.getElementById('budgetFormError');

        // Display elements
        this.elements.transactionList = document.getElementById('transactionList');
        this.elements.totalIncome = document.getElementById('totalIncome');
        this.elements.totalExpenses = document.getElementById('totalExpenses');
        this.elements.remainingBudget = document.getElementById('remainingBudget');
        this.elements.expenseChart = document.getElementById('expenseChart');

        // Theme toggle
        this.elements.themeToggle = document.getElementById('themeToggle');

        // Storage warning
        this.elements.storageWarning = document.getElementById('storageWarning');

        // Initialize chart renderer
        this.chartRenderer = new ChartRenderer(this.elements.expenseChart);
    }

    // Setup event listeners
    _setupEventListeners() {
        // Transaction form submission
        this.elements.transactionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTransactionSubmit();
        });

        // Budget form submission
        this.elements.budgetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBudgetSubmit();
        });

        // Transaction deletion (event delegation)
        this.elements.transactionList.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete-transaction') ||
                e.target.closest('.btn-delete-transaction')) {
                const button = e.target.classList.contains('btn-delete-transaction')
                    ? e.target
                    : e.target.closest('.btn-delete-transaction');
                const transactionId = button.getAttribute('data-id');
                if (transactionId) {
                    this.handleTransactionDelete(transactionId);
                }
            }
        });

        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => {
            this.handleThemeToggle();
        });
    }

    // Set default date to today
    _setDefaultDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        this.elements.dateInput.value = dateString;
    }

    // Show storage warning if localStorage is unavailable
    _showStorageWarning() {
        if (this.elements.storageWarning) {
            this.elements.storageWarning.style.display = 'block';
        }
    }

    // Handle transaction form submission
    handleTransactionSubmit() {
        this.clearErrors('transaction');

        // Get form data
        const amount = this.elements.amountInput.value.trim();
        const category = this.elements.categoryInput.value;
        const description = this.elements.descriptionInput.value.trim();
        const date = this.elements.dateInput.value;

        try {
            // Add transaction
            this.transactionManager.addTransaction(amount, category, description, date);

            // Reset form
            this.elements.transactionForm.reset();
            this._setDefaultDate();

            // Update UI
            this.updateUI();
        } catch (error) {
            // Display validation errors
            this.displayError('transaction', error.message);
        }
    }

    // Handle transaction deletion
    handleTransactionDelete(transactionId) {
        const deleted = this.transactionManager.deleteTransaction(transactionId);

        if (deleted) {
            this.updateUI();
        }
    }

    // Handle budget form submission
    handleBudgetSubmit() {
        this.clearErrors('budget');

        // Get form data
        const budgetAmount = this.elements.budgetInput.value.trim();

        try {
            // Set budget
            this.budgetManager.setBudget(budgetAmount);

            // Update UI
            this.updateUI();
        } catch (error) {
            // Display validation errors
            this.displayError('budget', error.message);
        }
    }

    // Handle theme toggle
    handleThemeToggle() {
        const newTheme = this.themeManager.toggle();

        // Update theme toggle button icon
        const themeIcon = this.elements.themeToggle.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    // Render transaction list
    renderTransactionList() {
        const transactions = this.transactionManager.getTransactions();
        this.elements.transactionList.innerHTML = '';

        // Show empty state if no transactions
        if (transactions.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'No transactions yet. Add your first transaction above!';
            this.elements.transactionList.appendChild(emptyState);
            return;
        }

        // Create transaction items
        transactions.forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.className = 'transaction-item';

            // Date
            const dateEl = document.createElement('div');
            dateEl.className = 'transaction-date';
            dateEl.textContent = transaction.date;

            // Category
            const categoryEl = document.createElement('div');
            categoryEl.className = 'transaction-category';
            categoryEl.textContent = transaction.category;

            // Description
            const descriptionEl = document.createElement('div');
            descriptionEl.className = 'transaction-description';
            descriptionEl.textContent = transaction.description || '(No description)';

            // Amount
            const amountEl = document.createElement('div');
            amountEl.className = 'transaction-amount';
            if (transaction.amount >= 0) {
                amountEl.classList.add('positive');
                amountEl.textContent = `+$${transaction.amount.toFixed(2)}`;
            } else {
                amountEl.classList.add('negative');
                amountEl.textContent = `-$${Math.abs(transaction.amount).toFixed(2)}`;
            }

            // Delete button
            const actionsEl = document.createElement('div');
            actionsEl.className = 'transaction-actions';
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger btn-delete-transaction';
            deleteBtn.setAttribute('data-id', transaction.id);
            deleteBtn.textContent = 'Delete';
            actionsEl.appendChild(deleteBtn);

            // Append all elements
            transactionItem.appendChild(dateEl);
            transactionItem.appendChild(categoryEl);
            transactionItem.appendChild(descriptionEl);
            transactionItem.appendChild(amountEl);
            transactionItem.appendChild(actionsEl);

            this.elements.transactionList.appendChild(transactionItem);
        });
    }

    // Render monthly summary
    renderSummary() {
        // Get current month and year
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Get all transactions and budget
        const transactions = this.transactionManager.getTransactions();
        const budget = this.budgetManager.getBudget();

        // Calculate summary
        const summary = this.summaryCalculator.calculateSummary(
            transactions,
            budget,
            currentYear,
            currentMonth
        );

        // Update display
        this.elements.totalIncome.textContent = `$${summary.totalIncome.toFixed(2)}`;
        this.elements.totalExpenses.textContent = `$${summary.totalExpenses.toFixed(2)}`;
        this.elements.remainingBudget.textContent = `$${summary.remainingBudget.toFixed(2)}`;

        // Apply warning styling if over budget
        if (summary.isOverBudget) {
            this.elements.remainingBudget.classList.add('over-budget');
            this.elements.remainingBudget.classList.add('negative');
        } else {
            this.elements.remainingBudget.classList.remove('over-budget');
            this.elements.remainingBudget.classList.remove('negative');
        }
    }

    // Render pie chart
    renderChart() {
        const transactions = this.transactionManager.getTransactions();
        this.chartRenderer.render(transactions);
    }

    // Master updateUI method - updates all UI components
    updateUI() {
        this.renderTransactionList();
        this.renderSummary();
        this.renderChart();
    }

    // Display error message
    displayError(formType, message) {
        if (formType === 'transaction') {
            this.elements.transactionFormError.textContent = message;
            this.elements.transactionFormError.style.display = 'block';
            this.elements.transactionFormError.classList.add('text-error');
        } else if (formType === 'budget') {
            this.elements.budgetFormError.textContent = message;
            this.elements.budgetFormError.style.display = 'block';
            this.elements.budgetFormError.classList.add('text-error');
        }
    }

    // Clear error messages
    clearErrors(formType = 'all') {
        if (formType === 'transaction' || formType === 'all') {
            this.elements.transactionFormError.textContent = '';
            this.elements.transactionFormError.style.display = 'none';
            this.elements.transactionFormError.classList.remove('text-error');
        }

        if (formType === 'budget' || formType === 'all') {
            this.elements.budgetFormError.textContent = '';
            this.elements.budgetFormError.style.display = 'none';
            this.elements.budgetFormError.classList.remove('text-error');
        }
    }
}

// ============================================================================
// Application Initialization
// Initialize the application when DOM is fully loaded
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    const app = new UIController();
    app.init();
});
