const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Other'];

class StorageManager {
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

class TransactionManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.transactions = [];
        this.storageKey = 'transactions';
        this._loadFromStorage();
    }

    _loadFromStorage() {
        const storedTransactions = this.storageManager.load(this.storageKey);
        if (storedTransactions && Array.isArray(storedTransactions)) {
            this.transactions = storedTransactions;
        }
    }

    _saveToStorage() {
        try {
            this.storageManager.save(this.storageKey, this.transactions);
        } catch (e) {
            console.error('Failed to save transactions:', e);
        }
    }

    _generateId() {
        return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    validateTransaction(amount, category, date) {
        const errors = [];
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || !isFinite(numericAmount)) {
            errors.push('Amount must be a valid number');
        } else if (numericAmount === 0) {
            errors.push('Amount cannot be zero');
        }
        if (!category || category.trim() === '') {
            errors.push('Category is required');
        } else if (!CATEGORIES.includes(category)) {
            errors.push('Invalid category selected');
        }
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

    addTransaction(amount, category, description, date) {
        const validation = this.validateTransaction(amount, category, date);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }
        const transaction = {
            id: this._generateId(),
            amount: parseFloat(amount),
            category: category,
            description: description || '',
            date: date,
            timestamp: Date.now()
        };
        this.transactions.push(transaction);
        this._saveToStorage();
        return transaction;
    }

    deleteTransaction(id) {
        const initialLength = this.transactions.length;
        this.transactions = this.transactions.filter(t => t.id !== id);
        const deleted = this.transactions.length < initialLength;
        if (deleted) {
            this._saveToStorage();
        }
        return deleted;
    }

    getTransactions() {
        return [...this.transactions].sort((a, b) => b.timestamp - a.timestamp);
    }

    getTransactionsByMonth(year, month) {
        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getFullYear() === year &&
                   transactionDate.getMonth() === month;
        });
    }
}

class BudgetManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.budget = null;
        this.storageKey = 'budget';
        this._loadFromStorage();
    }

    _loadFromStorage() {
        const storedBudget = this.storageManager.load(this.storageKey);
        if (storedBudget && typeof storedBudget.amount === 'number') {
            this.budget = storedBudget.amount;
        }
    }

    _saveToStorage() {
        try {
            this.storageManager.save(this.storageKey, { amount: this.budget });
        } catch (e) {
            console.error('Failed to save budget:', e);
        }
    }

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

    setBudget(amount) {
        const validation = this.validateBudget(amount);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }
        this.budget = parseFloat(amount);
        this._saveToStorage();
    }

    getBudget() {
        return this.budget;
    }
}

class ChartRenderer {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.categoryColors = {
            'Food': '#FF6384',
            'Transport': '#36A2EB',
            'Entertainment': '#FFCE56',
            'Utilities': '#4BC0C0',
            'Other': '#9966FF'
        };
    }

    calculateCategoryDistribution(transactions) {
        const expenses = transactions.filter(t => t.amount < 0);
        if (expenses.length === 0) {
            return new Map();
        }
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

    render(transactions) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const distribution = this.calculateCategoryDistribution(transactions);
        if (distribution.size === 0) {
            this.clear();
            return;
        }
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        let currentAngle = -Math.PI / 2;
        distribution.forEach((data, category) => {
            const sliceAngle = (data.percentage / 100) * 2 * Math.PI;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = data.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            currentAngle += sliceAngle;
        });
        this._drawLegend(distribution);
    }

    _drawLegend(distribution) {
        const legendX = 10;
        let legendY = 10;
        const boxSize = 15;
        const spacing = 5;
        this.ctx.font = '12px Arial';
        this.ctx.textBaseline = 'middle';
        distribution.forEach((data, category) => {
            this.ctx.fillStyle = data.color;
            this.ctx.fillRect(legendX, legendY, boxSize, boxSize);
            this.ctx.fillStyle = '#333333';
            this.ctx.fillText(
                `${category}: ${data.percentage.toFixed(1)}%`,
                legendX + boxSize + spacing,
                legendY + boxSize / 2
            );
            legendY += boxSize + spacing + 5;
        });
    }

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

class ThemeManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.currentTheme = 'light';
        this.storageKey = 'theme';
        this._loadFromStorage();
    }

    _loadFromStorage() {
        const storedTheme = this.storageManager.load(this.storageKey);
        if (storedTheme === 'light' || storedTheme === 'dark') {
            this.currentTheme = storedTheme;
        } else {
            this.currentTheme = 'light';
        }
    }

    _saveToStorage() {
        try {
            this.storageManager.save(this.storageKey, this.currentTheme);
        } catch (e) {
            console.error('Failed to save theme preference:', e);
        }
    }

    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this._saveToStorage();
        this.applyTheme();
        return this.currentTheme;
    }

    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') {
            throw new Error('Invalid theme. Must be "light" or "dark"');
        }
        this.currentTheme = theme;
        this._saveToStorage();
        this.applyTheme();
    }

    getTheme() {
        return this.currentTheme;
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }
}

class SummaryCalculator {
    filterByMonth(transactions, year, month) {
        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getFullYear() === year &&
                   transactionDate.getMonth() === month;
        });
    }

    calculateSummary(transactions, budget, year, month) {
        const monthTransactions = this.filterByMonth(transactions, year, month);
        let totalIncome = 0;
        let totalExpenses = 0;
        monthTransactions.forEach(transaction => {
            if (transaction.amount > 0) {
                totalIncome += transaction.amount;
            } else {
                totalExpenses += Math.abs(transaction.amount);
            }
        });
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

class UIController {
    constructor() {
        this.storageManager = new StorageManager();
        this.transactionManager = new TransactionManager(this.storageManager);
        this.budgetManager = new BudgetManager(this.storageManager);
        this.summaryCalculator = new SummaryCalculator();
        this.themeManager = new ThemeManager(this.storageManager);
        this.elements = {};
        this.initialized = false;
    }

    init() {
        if (this.initialized) {
            return;
        }
        this._setupDOMReferences();
        if (!this.storageManager.isAvailable()) {
            this._showStorageWarning();
        }
        this.themeManager.applyTheme();
        this._setupEventListeners();
        this._setDefaultDate();
        this.updateUI();
        this.initialized = true;
        console.log('Expense & Budget Visualizer initialized successfully');
    }

    _setupDOMReferences() {
        this.elements.transactionForm = document.getElementById('transactionForm');
        this.elements.budgetForm = document.getElementById('budgetForm');
        this.elements.amountInput = document.getElementById('amount');
        this.elements.categoryInput = document.getElementById('category');
        this.elements.descriptionInput = document.getElementById('description');
        this.elements.dateInput = document.getElementById('date');
        this.elements.transactionFormError = document.getElementById('transactionFormError');
        this.elements.budgetInput = document.getElementById('budget');
        this.elements.budgetFormError = document.getElementById('budgetFormError');
        this.elements.transactionList = document.getElementById('transactionList');
        this.elements.totalIncome = document.getElementById('totalIncome');
        this.elements.totalExpenses = document.getElementById('totalExpenses');
        this.elements.remainingBudget = document.getElementById('remainingBudget');
        this.elements.expenseChart = document.getElementById('expenseChart');
        this.elements.themeToggle = document.getElementById('themeToggle');
        this.elements.storageWarning = document.getElementById('storageWarning');
        this.chartRenderer = new ChartRenderer(this.elements.expenseChart);
    }

    _setupEventListeners() {
        this.elements.transactionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTransactionSubmit();
        });
        this.elements.budgetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBudgetSubmit();
        });
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
        this.elements.themeToggle.addEventListener('click', () => {
            this.handleThemeToggle();
        });
    }

    _setDefaultDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        this.elements.dateInput.value = dateString;
    }

    _showStorageWarning() {
        if (this.elements.storageWarning) {
            this.elements.storageWarning.style.display = 'block';
        }
    }

    handleTransactionSubmit() {
        this.clearErrors('transaction');
        const amount = this.elements.amountInput.value.trim();
        const category = this.elements.categoryInput.value;
        const description = this.elements.descriptionInput.value.trim();
        const date = this.elements.dateInput.value;
        try {
            this.transactionManager.addTransaction(amount, category, description, date);
            this.elements.transactionForm.reset();
            this._setDefaultDate();
            this.updateUI();
        } catch (error) {
            this.displayError('transaction', error.message);
        }
    }

    handleTransactionDelete(transactionId) {
        const deleted = this.transactionManager.deleteTransaction(transactionId);
        if (deleted) {
            this.updateUI();
        }
    }

    handleBudgetSubmit() {
        this.clearErrors('budget');
        const budgetAmount = this.elements.budgetInput.value.trim();
        try {
            this.budgetManager.setBudget(budgetAmount);
            this.updateUI();
        } catch (error) {
            this.displayError('budget', error.message);
        }
    }

    handleThemeToggle() {
        const newTheme = this.themeManager.toggle();
        const themeIcon = this.elements.themeToggle.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    renderTransactionList() {
        const transactions = this.transactionManager.getTransactions();
        this.elements.transactionList.innerHTML = '';
        if (transactions.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'No transactions yet. Add your first transaction above!';
            this.elements.transactionList.appendChild(emptyState);
            return;
        }
        transactions.forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.className = 'transaction-item';
            const dateEl = document.createElement('div');
            dateEl.className = 'transaction-date';
            dateEl.textContent = transaction.date;
            const categoryEl = document.createElement('div');
            categoryEl.className = 'transaction-category';
            categoryEl.textContent = transaction.category;
            const descriptionEl = document.createElement('div');
            descriptionEl.className = 'transaction-description';
            descriptionEl.textContent = transaction.description || '(No description)';
            const amountEl = document.createElement('div');
            amountEl.className = 'transaction-amount';
            if (transaction.amount >= 0) {
                amountEl.classList.add('positive');
                amountEl.textContent = `+$${transaction.amount.toFixed(2)}`;
            } else {
                amountEl.classList.add('negative');
                amountEl.textContent = `-$${Math.abs(transaction.amount).toFixed(2)}`;
            }
            const actionsEl = document.createElement('div');
            actionsEl.className = 'transaction-actions';
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger btn-delete-transaction';
            deleteBtn.setAttribute('data-id', transaction.id);
            deleteBtn.textContent = 'Delete';
            actionsEl.appendChild(deleteBtn);
            transactionItem.appendChild(dateEl);
            transactionItem.appendChild(categoryEl);
            transactionItem.appendChild(descriptionEl);
            transactionItem.appendChild(amountEl);
            transactionItem.appendChild(actionsEl);
            this.elements.transactionList.appendChild(transactionItem);
        });
    }

    renderSummary() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const transactions = this.transactionManager.getTransactions();
        const budget = this.budgetManager.getBudget();
        const summary = this.summaryCalculator.calculateSummary(
            transactions,
            budget,
            currentYear,
            currentMonth
        );
        this.elements.totalIncome.textContent = `$${summary.totalIncome.toFixed(2)}`;
        this.elements.totalExpenses.textContent = `$${summary.totalExpenses.toFixed(2)}`;
        this.elements.remainingBudget.textContent = `$${summary.remainingBudget.toFixed(2)}`;
        if (summary.isOverBudget) {
            this.elements.remainingBudget.classList.add('over-budget');
            this.elements.remainingBudget.classList.add('negative');
        } else {
            this.elements.remainingBudget.classList.remove('over-budget');
            this.elements.remainingBudget.classList.remove('negative');
        }
    }

    renderChart() {
        const transactions = this.transactionManager.getTransactions();
        this.chartRenderer.render(transactions);
    }

    updateUI() {
        this.renderTransactionList();
        this.renderSummary();
        this.renderChart();
    }

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

document.addEventListener('DOMContentLoaded', () => {
    const app = new UIController();
    app.init();
});
