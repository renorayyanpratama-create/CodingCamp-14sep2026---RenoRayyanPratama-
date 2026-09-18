// Expense & Budget Visualizer Application

// ============================================================================
// Data Model Constants and Structures
// ============================================================================

/**
 * Predefined transaction categories
 * Requirements: 2.1 - Categories: Food, Transport, Entertainment, Utilities, Other
 */
const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Other'];

/**
 * Transaction data structure
 * @typedef {Object} Transaction
 * @property {string} id - Unique identifier (timestamp-based)
 * @property {number} amount - Positive for income, negative for expenses
 * @property {string} category - One of: Food, Transport, Entertainment, Utilities, Other
 * @property {string} description - User-provided description
 * @property {string} date - ISO 8601 date format (YYYY-MM-DD)
 * @property {number} timestamp - Creation timestamp for sorting
 */

/**
 * Budget data structure
 * @typedef {Object} Budget
 * @property {number} amount - Positive numeric value
 */

/**
 * Theme data structure
 * @typedef {Object} Theme
 * @property {string} mode - 'light' or 'dark'
 */

/**
 * Monthly Summary data structure
 * @typedef {Object} MonthlySummary
 * @property {number} totalIncome - Sum of positive transaction amounts
 * @property {number} totalExpenses - Sum of negative transaction amounts (absolute value)
 * @property {number} remainingBudget - budget - totalExpenses
 * @property {boolean} isOverBudget - true if remainingBudget < 0
 */

// ============================================================================
// StorageManager - Handles localStorage operations
// ============================================================================

/**
 * StorageManager - Handles all localStorage operations with JSON serialization
 * Provides abstraction layer for data persistence
 * Requirements: 7.5, 7.6
 */
class StorageManager {
    /**
     * Check if localStorage is available and accessible
     * @returns {boolean} True if localStorage is available, false otherwise
     */
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

    /**
     * Save data to localStorage with JSON serialization
     * @param {string} key - The storage key
     * @param {*} data - The data to store (will be JSON serialized)
     * @throws {Error} If storage is unavailable or serialization fails
     */
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

    /**
     * Load data from localStorage with JSON deserialization
     * @param {string} key - The storage key
     * @returns {*} The deserialized data, or null if key doesn't exist
     */
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

    /**
     * Remove data from localStorage
     * @param {string} key - The storage key to remove
     */
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
// TransactionManager - Manages transaction data and operations
// ============================================================================

/**
 * TransactionManager - Handles transaction creation, deletion, retrieval, and validation
 * Integrates with StorageManager for data persistence
 * Requirements: 1.1, 1.2, 1.3, 1.4, 7.1, 7.3
 */
class TransactionManager {
    /**
     * Initialize TransactionManager with StorageManager dependency
     * @param {StorageManager} storageManager - Storage manager instance for persistence
     */
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.transactions = [];
        this.storageKey = 'transactions';
        
        // Load existing transactions from storage
        this._loadFromStorage();
    }

    /**
     * Load transactions from storage on initialization
     * @private
     */
    _loadFromStorage() {
        const storedTransactions = this.storageManager.load(this.storageKey);
        if (storedTransactions && Array.isArray(storedTransactions)) {
            this.transactions = storedTransactions;
        }
    }

    /**
     * Save transactions to storage
     * @private
     */
    _saveToStorage() {
        try {
            this.storageManager.save(this.storageKey, this.transactions);
        } catch (e) {
            console.error('Failed to save transactions:', e);
            // Don't throw - allow application to continue in memory-only mode
        }
    }

    /**
     * Generate a unique transaction ID
     * @returns {string} Unique ID based on timestamp and random string
     * @private
     */
    _generateId() {
        return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Validate transaction data
     * Requirements: 1.6, 1.7
     * @param {number|string} amount - Transaction amount (positive or negative)
     * @param {string} category - Transaction category
     * @param {string} date - Transaction date in YYYY-MM-DD format
     * @returns {Object} Validation result with { valid: boolean, errors: string[] }
     */
    validateTransaction(amount, category, date) {
        const errors = [];

        // Validate amount (must be numeric and non-zero)
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || !isFinite(numericAmount)) {
            errors.push('Amount must be a valid number');
        } else if (numericAmount === 0) {
            errors.push('Amount cannot be zero');
        }

        // Validate category (must be one of predefined categories)
        if (!category || category.trim() === '') {
            errors.push('Category is required');
        } else if (!CATEGORIES.includes(category)) {
            errors.push('Invalid category selected');
        }

        // Validate date (must be provided and valid)
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

    /**
     * Add a new transaction
     * Requirements: 1.1, 1.2, 7.1
     * @param {number|string} amount - Transaction amount (positive for income, negative for expense)
     * @param {string} category - Transaction category
     * @param {string} description - Transaction description
     * @param {string} date - Transaction date in YYYY-MM-DD format
     * @returns {Object} The created transaction object
     * @throws {Error} If validation fails
     */
    addTransaction(amount, category, description, date) {
        // Validate transaction data
        const validation = this.validateTransaction(amount, category, date);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        // Create new transaction object
        const transaction = {
            id: this._generateId(),
            amount: parseFloat(amount),
            category: category,
            description: description || '',
            date: date,
            timestamp: Date.now()
        };

        // Add to transactions array
        this.transactions.push(transaction);

        // Save to storage
        this._saveToStorage();

        return transaction;
    }

    /**
     * Delete a transaction by ID
     * Requirements: 1.3, 7.1
     * @param {string} id - Transaction ID to delete
     * @returns {boolean} True if transaction was deleted, false if not found
     */
    deleteTransaction(id) {
        const initialLength = this.transactions.length;
        this.transactions = this.transactions.filter(t => t.id !== id);

        // Check if deletion occurred
        const deleted = this.transactions.length < initialLength;

        if (deleted) {
            // Save to storage
            this._saveToStorage();
        }

        return deleted;
    }

    /**
     * Get all transactions sorted by date (newest first)
     * Requirements: 1.4
     * @returns {Array<Object>} Array of transactions sorted by timestamp descending
     */
    getTransactions() {
        // Sort by timestamp descending (newest first)
        return [...this.transactions].sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Get transactions filtered by specific month and year
     * Requirements: 5.8
     * @param {number} year - The year (e.g., 2024)
     * @param {number} month - The month (0-11, where 0 is January)
     * @returns {Array<Object>} Array of transactions from the specified month
     */
    getTransactionsByMonth(year, month) {
        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getFullYear() === year && 
                   transactionDate.getMonth() === month;
        });
    }
}

// ============================================================================
// BudgetManager - Manages budget data and operations
// ============================================================================

/**
 * BudgetManager - Handles budget storage, retrieval, and validation
 * Integrates with StorageManager for data persistence
 * Requirements: 3.1, 3.2, 3.5, 7.2, 7.4
 */
class BudgetManager {
    /**
     * Initialize BudgetManager with StorageManager dependency
     * @param {StorageManager} storageManager - Storage manager instance for persistence
     */
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.budget = null;
        this.storageKey = 'budget';
        
        // Load existing budget from storage
        this._loadFromStorage();
    }

    /**
     * Load budget from storage on initialization
     * @private
     */
    _loadFromStorage() {
        const storedBudget = this.storageManager.load(this.storageKey);
        if (storedBudget && typeof storedBudget.amount === 'number') {
            this.budget = storedBudget.amount;
        }
    }

    /**
     * Save budget to storage
     * @private
     */
    _saveToStorage() {
        try {
            this.storageManager.save(this.storageKey, { amount: this.budget });
        } catch (e) {
            console.error('Failed to save budget:', e);
            // Don't throw - allow application to continue in memory-only mode
        }
    }

    /**
     * Validate budget value
     * Requirements: 3.3
     * @param {number|string} amount - Budget amount to validate
     * @returns {Object} Validation result with { valid: boolean, errors: string[] }
     */
    validateBudget(amount) {
        const errors = [];

        // Validate amount (must be numeric, positive, and non-zero)
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

    /**
     * Set the monthly budget
     * Requirements: 3.1, 3.2, 3.5, 7.2, 7.4
     * @param {number|string} amount - Budget amount to set
     * @throws {Error} If validation fails
     */
    setBudget(amount) {
        // Validate budget data
        const validation = this.validateBudget(amount);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        // Set budget value
        this.budget = parseFloat(amount);

        // Save to storage
        this._saveToStorage();
    }

    /**
     * Get the current monthly budget
     * Requirements: 3.2, 7.4
     * @returns {number|null} Current budget amount or null if not set
     */
    getBudget() {
        return this.budget;
    }
}

// ============================================================================
// ChartRenderer - Renders pie chart visualization using Canvas API
// ============================================================================

/**
 * ChartRenderer - Handles pie chart rendering for expense distribution by category
 * Uses HTML5 Canvas API for drawing without external libraries
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7
 */
class ChartRenderer {
    /**
     * Initialize ChartRenderer with canvas element
     * @param {HTMLCanvasElement} canvasElement - The canvas element to render on
     */
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        
        // Category color mapping as specified in requirements
        // Requirements: 4.3 - Distinct colors for each category
        this.categoryColors = {
            'Food': '#FF6384',
            'Transport': '#36A2EB',
            'Entertainment': '#FFCE56',
            'Utilities': '#4BC0C0',
            'Other': '#9966FF'
        };
    }

    /**
     * Calculate category distribution from transactions
     * Requirements: 4.2, 4.7
     * @param {Array<Object>} transactions - Array of all transactions
     * @returns {Map} Map of category to { amount, percentage, color }
     */
    calculateCategoryDistribution(transactions) {
        // Filter to only expenses (negative amounts)
        // Requirements: 4.7 - Include only expenses in chart
        const expenses = transactions.filter(t => t.amount < 0);

        // If no expenses, return empty map
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
                color: this.categoryColors[category] || '#CCCCCC' // Fallback color
            });
        }

        return distribution;
    }

    /**
     * Render pie chart on canvas
     * Requirements: 4.1, 4.6
     * @param {Array<Object>} transactions - Array of transactions to visualize
     */
    render(transactions) {
        // Clear canvas first
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate distribution
        const distribution = this.calculateCategoryDistribution(transactions);

        // If no expenses, show empty state
        // Requirements: 4.4 - Empty state handling
        if (distribution.size === 0) {
            this.clear();
            return;
        }

        // Calculate canvas center and radius
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10; // 10px padding

        // Draw pie slices
        // Requirements: 4.6 - Start from top (-Math.PI/2) going clockwise
        let currentAngle = -Math.PI / 2; // Start at top

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

    /**
     * Draw legend for pie chart
     * @param {Map} distribution - Category distribution data
     * @private
     */
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

    /**
     * Clear canvas and show empty state
     * Requirements: 4.4
     */
    clear() {
        // Clear entire canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw empty state message
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
// ThemeManager - Manages theme switching and persistence
// ============================================================================

/**
 * ThemeManager - Handles theme toggling, application, and persistence
 * Integrates with StorageManager for theme preference persistence
 * Requirements: 6.1, 6.2, 6.5, 6.6, 6.7
 */
class ThemeManager {
    /**
     * Initialize ThemeManager with StorageManager dependency
     * @param {StorageManager} storageManager - Storage manager instance for persistence
     */
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.currentTheme = 'light'; // Default theme
        this.storageKey = 'theme';
        
        // Load existing theme preference from storage
        this._loadFromStorage();
    }

    /**
     * Load theme preference from storage on initialization
     * Requirements: 6.6
     * @private
     */
    _loadFromStorage() {
        const storedTheme = this.storageManager.load(this.storageKey);
        if (storedTheme === 'light' || storedTheme === 'dark') {
            this.currentTheme = storedTheme;
        } else {
            // Default to 'light' if no preference stored (Requirement 6.7)
            this.currentTheme = 'light';
        }
    }

    /**
     * Save theme preference to storage
     * Requirements: 6.5
     * @private
     */
    _saveToStorage() {
        try {
            this.storageManager.save(this.storageKey, this.currentTheme);
        } catch (e) {
            console.error('Failed to save theme preference:', e);
            // Don't throw - allow application to continue without persistence
        }
    }

    /**
     * Toggle between light and dark themes
     * Requirements: 6.2
     * @returns {string} The new theme after toggling
     */
    toggle() {
        // Switch to opposite theme
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        
        // Save preference to storage
        this._saveToStorage();
        
        // Apply the new theme to DOM
        this.applyTheme();
        
        return this.currentTheme;
    }

    /**
     * Set specific theme (light or dark)
     * Requirements: 6.1
     * @param {string} theme - Theme to set ('light' or 'dark')
     * @throws {Error} If invalid theme value provided
     */
    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            throw new Error('Invalid theme. Must be "light" or "dark"');
        }
        
        this.currentTheme = theme;
        
        // Save preference to storage
        this._saveToStorage();
        
        // Apply the theme to DOM
        this.applyTheme();
    }

    /**
     * Get current theme
     * @returns {string} Current theme ('light' or 'dark')
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * Apply current theme to DOM by updating data-theme attribute
     * Requirements: 6.3, 6.4
     */
    applyTheme() {
        // Update data-theme attribute on document root element
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }
}

// ============================================================================
// SummaryCalculator - Calculates monthly financial summaries
// ============================================================================

/**
 * SummaryCalculator - Calculates total income, expenses, and remaining budget
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.8
 */
class SummaryCalculator {
    /**
     * Filter transactions by specific month and year
     * Requirements: 5.8
     * @param {Array<Object>} transactions - Array of all transactions
     * @param {number} year - The year (e.g., 2024)
     * @param {number} month - The month (0-11, where 0 is January)
     * @returns {Array<Object>} Array of transactions from the specified month
     */
    filterByMonth(transactions, year, month) {
        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getFullYear() === year && 
                   transactionDate.getMonth() === month;
        });
    }

    /**
     * Calculate monthly financial summary
     * Requirements: 5.1, 5.2, 5.3, 5.4
     * @param {Array<Object>} transactions - Array of all transactions
     * @param {number|null} budget - Monthly budget amount (null if not set)
     * @param {number} year - The year for calculation
     * @param {number} month - The month for calculation (0-11)
     * @returns {Object} Summary with totalIncome, totalExpenses, remainingBudget, isOverBudget
     */
    calculateSummary(transactions, budget, year, month) {
        // Filter transactions for the specified month
        const monthTransactions = this.filterByMonth(transactions, year, month);

        // Calculate total income (sum of positive amounts)
        // Requirements: 5.2
        let totalIncome = 0;
        
        // Calculate total expenses (sum of absolute negative amounts)
        // Requirements: 5.3
        let totalExpenses = 0;

        monthTransactions.forEach(transaction => {
            if (transaction.amount > 0) {
                // Positive amount is income
                totalIncome += transaction.amount;
            } else {
                // Negative amount is expense (convert to positive for display)
                totalExpenses += Math.abs(transaction.amount);
            }
        });

        // Calculate remaining budget (budget - expenses)
        // Requirements: 5.4
        const budgetAmount = budget !== null ? budget : 0;
        const remainingBudget = budgetAmount - totalExpenses;

        // Determine if over budget (remaining budget is negative)
        // Requirements: 5.4
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
// UIController - Manages user interface and coordinates all components
// ============================================================================

/**
 * UIController - Main controller class that coordinates all managers and handles UI updates
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 11.1, 11.2, 11.3, 11.4, 12.1
 */
class UIController {
    /**
     * Initialize UIController
     */
    constructor() {
        // Initialize all managers
        this.storageManager = new StorageManager();
        this.transactionManager = new TransactionManager(this.storageManager);
        this.budgetManager = new BudgetManager(this.storageManager);
        this.summaryCalculator = new SummaryCalculator();
        this.themeManager = new ThemeManager(this.storageManager);
        
        // DOM element references
        this.elements = {};
        
        // Initialize flag
        this.initialized = false;
    }

    /**
     * Initialize the application
     * Requirements: 10.1, 7.5
     */
    init() {
        // Check if already initialized
        if (this.initialized) {
            return;
        }

        // Get DOM element references
        this._setupDOMReferences();

        // Check storage availability
        if (!this.storageManager.isAvailable()) {
            this._showStorageWarning();
        }

        // Apply saved theme
        this.themeManager.applyTheme();

        // Set up event listeners
        this._setupEventListeners();

        // Set default date to today
        this._setDefaultDate();

        // Initial UI render
        this.updateUI();

        // Mark as initialized
        this.initialized = true;

        console.log('Expense & Budget Visualizer initialized successfully');
    }

    /**
     * Set up DOM element references
     * @private
     */
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

    /**
     * Set up event listeners
     * @private
     */
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

    /**
     * Set default date to today
     * Requirements: 13.2
     * @private
     */
    _setDefaultDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        this.elements.dateInput.value = dateString;
    }

    /**
     * Show storage warning if localStorage is unavailable
     * Requirements: 7.5
     * @private
     */
    _showStorageWarning() {
        if (this.elements.storageWarning) {
            this.elements.storageWarning.style.display = 'block';
        }
    }

    /**
     * Handle transaction form submission
     * Requirements: 10.2, 1.1, 1.6, 1.7, 10.1, 10.2, 10.4, 10.5, 10.6
     */
    handleTransactionSubmit() {
        // Clear previous errors
        this.clearErrors('transaction');

        // Get form data
        const amount = this.elements.amountInput.value.trim();
        const category = this.elements.categoryInput.value;
        const description = this.elements.descriptionInput.value.trim();
        const date = this.elements.dateInput.value;

        try {
            // Add transaction (validation happens inside)
            this.transactionManager.addTransaction(amount, category, description, date);

            // Reset form
            this.elements.transactionForm.reset();
            
            // Set default date again after reset
            this._setDefaultDate();

            // Update UI
            this.updateUI();

        } catch (error) {
            // Display validation errors
            this.displayError('transaction', error.message);
        }
    }

    /**
     * Handle transaction deletion
     * Requirements: 10.3, 1.3
     * @param {string} transactionId - ID of transaction to delete
     */
    handleTransactionDelete(transactionId) {
        // Delete transaction
        const deleted = this.transactionManager.deleteTransaction(transactionId);

        if (deleted) {
            // Update UI
            this.updateUI();
        }
    }

    /**
     * Handle budget form submission
     * Requirements: 10.4, 3.1, 3.3, 3.4, 10.3, 10.4, 10.5
     */
    handleBudgetSubmit() {
        // Clear previous errors
        this.clearErrors('budget');

        // Get form data
        const budgetAmount = this.elements.budgetInput.value.trim();

        try {
            // Set budget (validation happens inside)
            this.budgetManager.setBudget(budgetAmount);

            // Update UI (summary will reflect new budget)
            this.updateUI();

        } catch (error) {
            // Display validation errors
            this.displayError('budget', error.message);
        }
    }

    /**
     * Handle theme toggle
     * Requirements: 10.5, 6.1, 6.2
     */
    handleThemeToggle() {
        // Toggle theme
        const newTheme = this.themeManager.toggle();

        // Update theme toggle button icon
        const themeIcon = this.elements.themeToggle.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    /**
     * Render transaction list
     * Requirements: 11.1, 1.2, 1.4, 2.4
     */
    renderTransactionList() {
        const transactions = this.transactionManager.getTransactions();

        // Clear existing list
        this.elements.transactionList.innerHTML = '';

        // If no transactions, show empty state
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

    /**
     * Render monthly summary
     * Requirements: 11.2, 5.1, 5.5, 5.6
     */
    renderSummary() {
        // Get current month and year
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Get all transactions
        const transactions = this.transactionManager.getTransactions();

        // Get budget
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
        // Requirements: 5.5, 5.6
        if (summary.isOverBudget) {
            this.elements.remainingBudget.classList.add('over-budget');
            this.elements.remainingBudget.classList.add('negative');
        } else {
            this.elements.remainingBudget.classList.remove('over-budget');
            this.elements.remainingBudget.classList.remove('negative');
        }
    }

    /**
     * Render pie chart
     * Requirements: 11.3, 4.1, 4.4, 4.5
     */
    renderChart() {
        // Get all transactions
        const transactions = this.transactionManager.getTransactions();

        // Render chart (handles empty state internally)
        this.chartRenderer.render(transactions);
    }

    /**
     * Master updateUI method - updates all UI components
     * Requirements: 11.4, 1.5, 3.4, 4.5, 5.7
     */
    updateUI() {
        this.renderTransactionList();
        this.renderSummary();
        this.renderChart();
    }

    /**
     * Display error message
     * Requirements: 12.1, 10.6
     * @param {string} formType - 'transaction' or 'budget'
     * @param {string} message - Error message to display
     */
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

    /**
     * Clear error messages
     * Requirements: 12.1, 10.5
     * @param {string} formType - 'transaction', 'budget', or 'all'
     */
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
// ============================================================================

/**
 * Initialize application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Create and initialize UI controller
    const app = new UIController();
    app.init();
});
