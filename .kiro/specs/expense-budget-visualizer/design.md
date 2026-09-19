# Design Document: Expense & Budget Visualizer

## Overview

The Expense & Budget Visualizer is a vanilla JavaScript web application that enables users to track financial transactions, visualize spending patterns through pie charts, monitor monthly budgets, and toggle between light and dark themes. The application uses browser localStorage for data persistence and must be implemented without external frameworks or libraries.

## Architecture

### High-Level Architecture

The application follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                      │
│  (HTML + CSS - Transaction Form, Charts, Summary)       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Application Core                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Transaction  │  │   Budget     │  │    Theme     │  │
│  │  Manager     │  │   Manager    │  │   Manager    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Rendering & Visualization                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Chart      │  │   Summary    │  │     UI       │  │
│  │  Renderer    │  │  Calculator  │  │   Updater    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Storage & Persistence                      │
│           (localStorage with JSON)                      │
└─────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. Transaction Manager
**Responsibilities:**
- Create, read, and delete transactions
- Validate transaction data (required fields, numeric amounts)
- Maintain transaction list in memory
- Sort transactions by date (newest first)
- Filter transactions by date range

**Interface:**
```javascript
class TransactionManager {
    constructor(storageManager)
    
    addTransaction(amount, category, description, date)
    // Returns: { id, amount, category, description, date, timestamp }
    // Throws: ValidationError if data is invalid
    
    deleteTransaction(id)
    // Returns: boolean (success)
    
    getTransactions()
    // Returns: Array of transactions sorted by date (newest first)
    
    getTransactionsByMonth(year, month)
    // Returns: Array of transactions for specified month
    
    validateTransaction(amount, category, date)
    // Returns: { valid: boolean, errors: Array }
}
```

#### 2. Budget Manager
**Responsibilities:**
- Store and retrieve budget values
- Validate budget input (positive numeric values)
- Notify observers when budget changes

**Interface:**
```javascript
class BudgetManager {
    constructor(storageManager)
    
    setBudget(amount)
    // Throws: ValidationError if amount is invalid
    
    getBudget()
    // Returns: number or null
    
    validateBudget(amount)
    // Returns: { valid: boolean, errors: Array }
}
```

#### 3. Summary Calculator
**Responsibilities:**
- Calculate total income for current month
- Calculate total expenses for current month
- Calculate remaining budget
- Determine if budget warning should be shown

**Interface:**
```javascript
class SummaryCalculator {
    calculateSummary(transactions, budget, year, month)
    // Returns: {
    //   totalIncome: number,
    //   totalExpenses: number,
    //   remainingBudget: number,
    //   isOverBudget: boolean
    // }
    
    filterByMonth(transactions, year, month)
    // Returns: Array of transactions in specified month
}
```

#### 4. Chart Renderer
**Responsibilities:**
- Render pie chart using HTML5 Canvas
- Calculate category spending percentages
- Assign distinct colors to categories
- Handle empty state visualization

**Interface:**
```javascript
class ChartRenderer {
    constructor(canvasElement)
    
    render(transactions)
    // Draws pie chart on canvas
    
    calculateCategoryDistribution(transactions)
    // Returns: Map { category: { amount, percentage, color } }
    
    clear()
    // Clears canvas and shows empty state
}
```

#### 5. Theme Manager
**Responsibilities:**
- Toggle between light and dark themes
- Apply theme-specific CSS classes
- Persist theme preference
- Restore theme on application load

**Interface:**
```javascript
class ThemeManager {
    constructor(storageManager)
    
    toggle()
    // Switches between light and dark themes
    
    setTheme(theme)
    // theme: 'light' or 'dark'
    
    getTheme()
    // Returns: 'light' or 'dark'
    
    applyTheme()
    // Applies current theme to DOM
}
```

#### 6. Storage Manager
**Responsibilities:**
- Abstract localStorage operations
- Serialize/deserialize data as JSON
- Handle storage errors
- Provide storage availability check

**Interface:**
```javascript
class StorageManager {
    save(key, data)
    // Serializes data to JSON and stores in localStorage
    // Throws: StorageError if unavailable
    
    load(key)
    // Deserializes and returns data from localStorage
    // Returns: null if key doesn't exist
    
    remove(key)
    // Removes item from localStorage
    
    isAvailable()
    // Returns: boolean indicating if localStorage is accessible
}
```

#### 7. UI Controller
**Responsibilities:**
- Coordinate between all components
- Handle user interactions
- Update UI in response to data changes
- Display validation errors
- Initialize application

**Interface:**
```javascript
class UIController {
    constructor()
    
    init()
    // Initializes all managers and sets up event listeners
    
    handleTransactionSubmit(event)
    // Processes transaction form submission
    
    handleTransactionDelete(transactionId)
    // Processes transaction deletion
    
    handleBudgetUpdate(amount)
    // Processes budget update
    
    handleThemeToggle()
    // Processes theme toggle
    
    updateUI()
    // Refreshes all UI components (list, chart, summary)
    
    displayError(message)
    // Shows error message to user
    
    clearErrors()
    // Removes error messages from UI
}
```

## Data Models

### Transaction
```javascript
{
    id: String,              // Unique identifier (timestamp-based)
    amount: Number,          // Positive for income, negative for expenses
    category: String,        // One of: Food, Transport, Entertainment, Utilities, Other
    description: String,     // User-provided description
    date: String,            // ISO 8601 date format (YYYY-MM-DD)
    timestamp: Number        // Creation timestamp for sorting
}
```

### Budget
```javascript
{
    amount: Number          // Positive numeric value
}
```

### Theme
```javascript
{
    mode: String            // 'light' or 'dark'
}
```

### Monthly Summary
```javascript
{
    totalIncome: Number,      // Sum of positive transaction amounts
    totalExpenses: Number,    // Sum of negative transaction amounts (absolute value)
    remainingBudget: Number,  // budget - totalExpenses
    isOverBudget: Boolean     // true if remainingBudget < 0
}
```

## File Structure

```
expense-budget-visualizer/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Single CSS file with light/dark theme styles
└── js/
    └── app.js              # Single JavaScript file with all application logic
```

## User Interface Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Header: "Expense & Budget Visualizer"   [Theme Toggle] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Transaction Form                                       │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Amount: [______]  Category: [Dropdown]            │ │
│  │ Description: [______________________]             │ │
│  │ Date: [____-__-__]         [Add Transaction]     │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Budget Setting                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Monthly Budget: [______]      [Set Budget]        │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Monthly Summary                │   Pie Chart          │
│  ┌──────────────────────────┐   │   ┌────────────────┐ │
│  │ Total Income:      $XXX  │   │   │                │ │
│  │ Total Expenses:    $XXX  │   │   │   [PIE CHART]  │ │
│  │ Remaining Budget:  $XXX  │   │   │                │ │
│  └──────────────────────────┘   │   └────────────────┘ │
├─────────────────────────────────┴─────────────────────────┤
│  Transaction List                                         │
│  ┌───────────────────────────────────────────────────┐   │
│  │ 2024-01-15 | Food | Groceries | -$50.00 | [Delete]│   │
│  │ 2024-01-14 | Income | Salary | +$2000.00 | [Delete]│  │
│  │ 2024-01-12 | Transport | Gas | -$30.00 | [Delete] │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Validation Rules

### Transaction Validation
1. **Amount**: Must be a non-zero numeric value (positive or negative)
2. **Category**: Must be one of the predefined categories (Food, Transport, Entertainment, Utilities, Other)
3. **Date**: Must be a valid date in YYYY-MM-DD format
4. **Description**: Optional but should be a string if provided

### Budget Validation
1. **Amount**: Must be a positive numeric value (> 0)

### Error Display
- Validation errors should be displayed near the relevant input field
- Error messages should use red text or red border highlighting
- Errors should be cleared when user corrects input

## Pie Chart Implementation

### Using HTML5 Canvas

The pie chart will be rendered using the Canvas 2D API:

```javascript
function renderPieChart(canvas, categoryData) {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    let currentAngle = -Math.PI / 2; // Start at top
    
    categoryData.forEach(category => {
        const sliceAngle = (category.percentage / 100) * 2 * Math.PI;
        
        // Draw slice
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = category.color;
        ctx.fill();
        
        currentAngle += sliceAngle;
    });
}
```

### Category Colors
- **Food**: #FF6384
- **Transport**: #36A2EB
- **Entertainment**: #FFCE56
- **Utilities**: #4BC0C0
- **Other**: #9966FF

### Empty State
When no expenses exist, display a placeholder circle with message "No expenses to display".

## Theme System

### CSS Variables Approach

```css
:root {
    --bg-primary: #ffffff;
    --bg-secondary: #f5f5f5;
    --text-primary: #333333;
    --text-secondary: #666666;
    --border-color: #dddddd;
    --accent-color: #007bff;
}

[data-theme="dark"] {
    --bg-primary: #1a1a1a;
    --bg-secondary: #2d2d2d;
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --border-color: #444444;
    --accent-color: #4d94ff;
}

body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
}
```

### Theme Toggle Implementation
- Toggle button in header
- Clicking toggle updates `data-theme` attribute on `<body>`
- Theme preference saved to localStorage as `theme` key
- Default theme: light

## Storage Schema

### localStorage Keys

1. **transactions**: JSON array of transaction objects
2. **budget**: JSON object with budget amount
3. **theme**: String ('light' or 'dark')

### Example Storage Data

```javascript
// localStorage.getItem('transactions')
[
    {
        "id": "1705334400000",
        "amount": -50.00,
        "category": "Food",
        "description": "Groceries",
        "date": "2024-01-15",
        "timestamp": 1705334400000
    },
    {
        "id": "1705248000000",
        "amount": 2000.00,
        "category": "Income",
        "description": "Salary",
        "date": "2024-01-14",
        "timestamp": 1705248000000
    }
]

// localStorage.getItem('budget')
{
    "amount": 1500.00
}

// localStorage.getItem('theme')
"dark"
```

## Error Handling

### Storage Errors
If localStorage is unavailable:
1. Display warning banner: "Warning: Data persistence is unavailable. Your data will not be saved."
2. Application continues to function in memory-only mode
3. All features work except data persistence

### Validation Errors
- Display inline error messages
- Prevent form submission
- Clear errors on valid input

### Runtime Errors
- Catch and log errors to console
- Display user-friendly error message
- Application should remain functional after recoverable errors

## Monthly Summary Calculation

### Algorithm

```javascript
function calculateMonthlySummary(transactions, budget) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Filter transactions for current month
    const currentMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getFullYear() === currentYear &&
               transactionDate.getMonth() === currentMonth;
    });
    
    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;
    
    currentMonthTransactions.forEach(t => {
        if (t.amount > 0) {
            totalIncome += t.amount;
        } else {
            totalExpenses += Math.abs(t.amount);
        }
    });
    
    // Calculate remaining budget
    const remainingBudget = budget - totalExpenses;
    const isOverBudget = remainingBudget < 0;
    
    return {
        totalIncome,
        totalExpenses,
        remainingBudget,
        isOverBudget
    };
}
```

## Performance Considerations

### Response Time Targets
- Transaction add/delete: < 100ms
- Budget update: < 100ms
- Theme toggle: < 100ms
- Chart rendering: < 200ms

### Optimization Strategies
1. **Debouncing**: Not required for this application (operations are discrete)
2. **Caching**: Cache calculated summary until data changes
3. **Efficient Rendering**: Only re-render components that changed
4. **Storage**: Batch writes if multiple operations occur (though unlikely)

## Accessibility Considerations

While not explicitly required, consider:
- Form labels properly associated with inputs
- Sufficient color contrast in both themes
- Keyboard navigation support
- ARIA labels for interactive elements
- Alt text for visual elements (chart)

## Application Initialization Flow

```
1. DOMContentLoaded event fires
   ↓
2. Initialize StorageManager and check availability
   ↓
3. Display warning if storage unavailable
   ↓
4. Initialize all manager classes
   ↓
5. Load data from storage (transactions, budget, theme)
   ↓
6. Apply saved theme or default to light
   ↓
7. Render initial UI (transaction list, chart, summary)
   ↓
8. Set up event listeners
   ↓
9. Application ready for user interaction
```

## Event Flow Examples

### Adding a Transaction

```
1. User fills transaction form
   ↓
2. User clicks "Add Transaction" button
   ↓
3. UIController.handleTransactionSubmit() called
   ↓
4. TransactionManager.validateTransaction() validates input
   ↓
5a. If invalid: Display error messages → End
   ↓
5b. If valid: Clear error messages → Continue
   ↓
6. TransactionManager.addTransaction() creates transaction
   ↓
7. StorageManager.save() persists transactions to localStorage
   ↓
8. UIController.updateUI() refreshes all components
   ↓
9. Transaction appears in list, chart updates, summary recalculates
   ↓
10. Form is reset for next entry
```

### Toggling Theme

```
1. User clicks theme toggle button
   ↓
2. UIController.handleThemeToggle() called
   ↓
3. ThemeManager.toggle() switches theme
   ↓
4. ThemeManager.applyTheme() updates DOM
   ↓
5. StorageManager.save() persists theme preference
   ↓
6. UI reflects new theme immediately
```

## Testing Considerations

### Unit Tests
- Transaction validation logic
- Budget validation logic
- Summary calculation
- Category distribution calculation
- Date filtering logic
- Storage serialization/deserialization

### Integration Tests
- Full transaction add/delete flow
- Budget update flow
- Theme toggle flow
- Data persistence and restoration
- Chart rendering

### Property-Based Tests
- Transaction management properties
- Calculation properties
- Storage round-trip properties
- UI state properties

(See Correctness Properties section below)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:
- **2.2** is covered by **1.7** (category is a required field)
- **2.5** is covered by **4.2** (pie chart calculation uses category data)
- **3.5** is covered by **7.4** (budget persistence)
- **5.7** is duplicate of **1.5** (transaction changes trigger summary update)
- **6.6** is covered by **6.5** (theme restoration is the restore side of persistence round-trip)
- **10.1** is duplicate of **1.7** (required field validation)
- **10.2** is duplicate of **1.6** (numeric validation)
- **10.3** is duplicate of **3.3** (budget validation)

Several properties can be combined:
- **1.1** and **1.2** can be combined into a single property about transaction creation and list inclusion
- **5.5** and **5.6** can be combined into a single property about conditional display styling
- **7.1** and **7.3** combine into a transaction storage round-trip property
- **7.2** and **7.4** combine into a budget storage round-trip property

### Property 1: Transaction Creation and List Inclusion

*For any* valid transaction data (non-empty amount, category, description, and date), creating a transaction with that data SHALL result in a transaction appearing in the transaction list with all provided fields matching the input.

**Validates: Requirements 1.1, 1.2**

### Property 2: Transaction Deletion Removes from List

*For any* transaction in the transaction list, deleting that transaction SHALL result in it no longer appearing in the list.

**Validates: Requirements 1.3**

### Property 3: Transactions Sorted by Date Descending

*For any* set of transactions with different dates, the transaction list SHALL always be ordered with the newest transaction first (reverse chronological order).

**Validates: Requirements 1.4**

### Property 4: Transaction Changes Update Summary

*For any* transaction addition or deletion, the monthly summary (total income, total expenses, remaining budget) SHALL be recalculated immediately to reflect the change.

**Validates: Requirements 1.5, 5.7**

### Property 5: Non-Numeric Amount Rejection

*For any* non-numeric input in the amount field, the system SHALL reject the transaction creation and display an error message.

**Validates: Requirements 1.6, 10.2**

### Property 6: Required Field Validation

*For any* transaction submission with missing required fields (amount, category, or date), the system SHALL reject the creation and display an error message.

**Validates: Requirements 1.7, 2.2, 10.1**

### Property 7: Single Category Association

*For any* created transaction, it SHALL have exactly one category assigned from the predefined category list.

**Validates: Requirements 2.3**

### Property 8: Category Display in Transaction

*For any* transaction, when rendered in the transaction list, the display SHALL include the assigned category.

**Validates: Requirements 2.4**

### Property 9: Budget Storage Round-Trip

*For any* valid positive numeric budget value, setting that budget SHALL store it such that retrieving the budget returns the same value.

**Validates: Requirements 3.2, 3.5, 7.2, 7.4**

### Property 10: Budget Validation Rejects Invalid Values

*For any* non-positive or non-numeric budget input, the system SHALL reject the budget update and display an error message.

**Validates: Requirements 3.3, 10.3**

### Property 11: Budget Changes Update Summary

*For any* budget update, the monthly summary SHALL be recalculated immediately to reflect the new budget in the remaining budget calculation.

**Validates: Requirements 3.4**

### Property 12: Pie Chart Percentage Calculation

*For any* set of expense transactions, the pie chart SHALL calculate percentages such that each category's percentage equals (category_expenses / total_expenses) × 100, and all percentages sum to 100%.

**Validates: Requirements 4.2, 2.5**

### Property 13: Distinct Category Colors

*For any* category in the pie chart, it SHALL be assigned a distinct color that differs from all other categories.

**Validates: Requirements 4.3**

### Property 14: Transaction Changes Update Chart

*For any* transaction addition or deletion, the pie chart SHALL be re-rendered to reflect the updated expense distribution.

**Validates: Requirements 4.5**

### Property 15: Chart Excludes Income

*For any* set of transactions containing both income (positive amounts) and expenses (negative amounts), the pie chart SHALL include only the expense transactions in its calculation.

**Validates: Requirements 4.7**

### Property 16: Income Calculation for Current Month

*For any* set of transactions, the total income SHALL equal the sum of all positive transaction amounts within the current calendar month.

**Validates: Requirements 5.2**

### Property 17: Expense Calculation for Current Month

*For any* set of transactions, the total expenses SHALL equal the sum of all negative transaction amounts (in absolute value) within the current calendar month.

**Validates: Requirements 5.3**

### Property 18: Remaining Budget Formula

*For any* budget amount and set of expenses, the remaining budget SHALL equal the budget amount minus total expenses.

**Validates: Requirements 5.4**

### Property 19: Budget Warning Display

*For any* calculated remaining budget, if the value is negative, it SHALL be displayed with a warning indicator (red text or warning styling); otherwise, it SHALL be displayed normally.

**Validates: Requirements 5.5, 5.6**

### Property 20: Monthly Filtering

*For any* set of transactions spanning multiple months, the monthly summary calculations SHALL include only transactions from the current calendar month.

**Validates: Requirements 5.8**

### Property 21: Theme Toggle State Transition

*For any* theme state (light or dark), activating the theme toggle SHALL switch to the opposite theme state.

**Validates: Requirements 6.2**

### Property 22: Theme Persistence Round-Trip

*For any* theme selection (light or dark), setting that theme SHALL persist it such that reloading the application restores the same theme.

**Validates: Requirements 6.5, 6.6**

### Property 23: Transaction Storage Round-Trip

*For any* set of transactions, saving them to storage and then loading from storage SHALL restore all transactions with all fields intact.

**Validates: Requirements 7.1, 7.3**

### Property 24: JSON Serialization Round-Trip

*For any* application data (transactions, budget, theme), serializing to JSON and then deserializing SHALL preserve the data unchanged.

**Validates: Requirements 7.6**

### Property 25: Form Submission Blocking on Validation Errors

*For any* form submission with validation errors, the submission SHALL be blocked, preventing invalid data from being processed.

**Validates: Requirements 10.4**

### Property 26: Error Message Clearing on Valid Submission

*For any* valid form submission following a validation error, all previous error messages SHALL be cleared from the display.

**Validates: Requirements 10.5**

## Implementation Notes

### Category Enum
Define categories as a constant to ensure consistency:

```javascript
const CATEGORIES = {
    FOOD: 'Food',
    TRANSPORT: 'Transport',
    ENTERTAINMENT: 'Entertainment',
    UTILITIES: 'Utilities',
    OTHER: 'Other'
};
```

### Transaction ID Generation
Use timestamp-based IDs to ensure uniqueness:

```javascript
function generateTransactionId() {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```

### Date Handling
Use native Date objects internally, convert to/from ISO strings for storage and display:

```javascript
// For storage
const dateString = transaction.date; // "2024-01-15"

// For filtering
const date = new Date(dateString);
const year = date.getFullYear();
const month = date.getMonth();
```

### Numeric Validation
Use `parseFloat()` with validation:

```javascript
function isValidNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
}
```

## Future Enhancements (Out of Scope)

These features are not required for the current version but could be considered:
- Multiple budget periods (weekly, yearly)
- Export data to CSV
- Import data from file
- Category customization
- Transaction search/filter
- Recurring transactions
- Multiple currency support
- Data backup/restore
- Transaction editing
- Budget history tracking

## Conclusion

This design provides a comprehensive blueprint for implementing the Expense & Budget Visualizer application. The modular architecture ensures clear separation of concerns, making the codebase maintainable despite being in a single JavaScript file. The correctness properties provide a formal specification for testing and validation, ensuring the application behaves correctly across all use cases.
