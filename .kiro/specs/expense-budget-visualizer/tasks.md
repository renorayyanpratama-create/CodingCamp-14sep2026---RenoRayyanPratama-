# Implementation Plan: Expense & Budget Visualizer

## Overview

This plan outlines the implementation of a vanilla JavaScript web application for tracking expenses and budgets with data visualization. The implementation will be structured in incremental steps, building from core infrastructure through data management, visualization, and user interface components.

## Tasks

- [x] 1. Set up project structure and HTML foundation
  - Create `index.html` with semantic structure and form elements
  - Create `css/` and `js/` directories
  - Define HTML structure for transaction form, budget input, summary display, chart container, and transaction list
  - Include references to single CSS and JavaScript files
  - _Requirements: 8.1, 8.2, 8.6_

- [x] 2. Implement core storage manager and data models
  - [x] 2.1 Create StorageManager class in `js/app.js`
    - Implement save(), load(), remove(), and isAvailable() methods
    - Add JSON serialization/deserialization logic
    - Add error handling for storage unavailable scenarios
    - _Requirements: 7.5, 7.6_
  
  - [ ]* 2.2 Write property test for storage round-trip
    - **Property 24: JSON Serialization Round-Trip**
    - **Validates: Requirements 7.6**
  
  - [x] 2.3 Define data model constants and structures
    - Define CATEGORIES constant with all category values
    - Define transaction data structure with id, amount, category, description, date, timestamp
    - Define budget data structure
    - Define theme data structure
    - _Requirements: 2.1_

- [x] 3. Implement transaction manager with validation
  - [x] 3.1 Create TransactionManager class
    - Implement addTransaction() with ID generation and timestamp
    - Implement deleteTransaction() method
    - Implement getTransactions() with date sorting (newest first)
    - Implement getTransactionsByMonth() for monthly filtering
    - Integrate with StorageManager for persistence
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.1, 7.3_
  
  - [x] 3.2 Implement transaction validation logic
    - Add validateTransaction() method checking required fields
    - Add numeric validation for amount field
    - Add category validation against CATEGORIES constant
    - Add date format validation
    - Return validation errors array
    - _Requirements: 1.6, 1.7, 2.2_
  
  - [ ]* 3.3 Write property tests for transaction management
    - **Property 1: Transaction Creation and List Inclusion**
    - **Validates: Requirements 1.1, 1.2**
  
  - [ ]* 3.4 Write property test for transaction deletion
    - **Property 2: Transaction Deletion Removes from List**
    - **Validates: Requirements 1.3**
  
  - [ ]* 3.5 Write property test for transaction sorting
    - **Property 3: Transactions Sorted by Date Descending**
    - **Validates: Requirements 1.4**
  
  - [ ]* 3.6 Write property tests for validation
    - **Property 5: Non-Numeric Amount Rejection**
    - **Property 6: Required Field Validation**
    - **Validates: Requirements 1.6, 1.7, 2.2, 10.1, 10.2**

- [x] 4. Implement budget manager
  - [x] 4.1 Create BudgetManager class
    - Implement setBudget() with validation
    - Implement getBudget() method
    - Implement validateBudget() for positive numeric values
    - Integrate with StorageManager for persistence
    - _Requirements: 3.1, 3.2, 3.5, 7.2, 7.4_
  
  - [ ]* 4.2 Write property tests for budget management
    - **Property 9: Budget Storage Round-Trip**
    - **Property 10: Budget Validation Rejects Invalid Values**
    - **Validates: Requirements 3.2, 3.3, 3.5, 7.2, 7.4, 10.3**

- [x] 5. Checkpoint - Core data management complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement summary calculator
  - [ ] 6.1 Create SummaryCalculator class
    - Implement filterByMonth() to get current month transactions
    - Implement calculateSummary() for income, expenses, and remaining budget
    - Calculate total income (sum of positive amounts)
    - Calculate total expenses (sum of absolute negative amounts)
    - Calculate remaining budget (budget - expenses)
    - Set isOverBudget flag when remaining budget is negative
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.8_
  
  - [ ]* 6.2 Write property tests for summary calculations
    - **Property 16: Income Calculation for Current Month**
    - **Property 17: Expense Calculation for Current Month**
    - **Property 18: Remaining Budget Formula**
    - **Property 20: Monthly Filtering**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.8**

- [ ] 7. Implement pie chart renderer
  - [ ] 7.1 Create ChartRenderer class using Canvas API
    - Implement render() method to draw pie chart
    - Implement calculateCategoryDistribution() to compute percentages
    - Assign distinct colors to each category (Food: #FF6384, Transport: #36A2EB, Entertainment: #FFCE56, Utilities: #4BC0C0, Other: #9966FF)
    - Filter to include only expenses (negative amounts)
    - Implement clear() method for empty state
    - Draw slices starting from top (-Math.PI/2) going clockwise
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7_
  
  - [ ]* 7.2 Write property tests for chart calculations
    - **Property 12: Pie Chart Percentage Calculation**
    - **Property 13: Distinct Category Colors**
    - **Property 15: Chart Excludes Income**
    - **Validates: Requirements 4.2, 4.3, 4.7, 2.5**

- [ ] 8. Implement theme manager
  - [ ] 8.1 Create ThemeManager class
    - Implement toggle() to switch between light and dark themes
    - Implement setTheme() to apply specific theme
    - Implement getTheme() to retrieve current theme
    - Implement applyTheme() to update DOM data-theme attribute
    - Integrate with StorageManager for theme persistence
    - Default to 'light' theme if no preference stored
    - _Requirements: 6.1, 6.2, 6.5, 6.6, 6.7_
  
  - [ ]* 8.2 Write property tests for theme management
    - **Property 21: Theme Toggle State Transition**
    - **Property 22: Theme Persistence Round-Trip**
    - **Validates: Requirements 6.2, 6.5, 6.6**

- [ ] 9. Implement CSS styling with theme support
  - [ ] 9.1 Create `css/styles.css` with CSS variables and theme support
    - Define CSS variables for light theme colors (--bg-primary, --bg-secondary, --text-primary, --text-secondary, --border-color, --accent-color)
    - Define dark theme overrides using [data-theme="dark"] selector
    - Style transaction form with input fields and buttons
    - Style budget input section
    - Style monthly summary display with conditional styling for over-budget warning
    - Style transaction list with date, category, description, amount, and delete button
    - Style pie chart container
    - Style theme toggle button
    - Ensure responsive layout for summary and chart sections
    - Add red text/warning styling for negative remaining budget
    - _Requirements: 6.3, 6.4, 5.5, 5.6_

- [ ] 10. Implement UI controller and event handling
  - [ ] 10.1 Create UIController class with initialization
    - Initialize all manager classes (Storage, Transaction, Budget, Summary, Chart, Theme)
    - Set up DOM element references
    - Check storage availability and display warning if unavailable
    - Load persisted data (transactions, budget, theme) on initialization
    - Apply saved or default theme
    - Render initial UI state
    - _Requirements: 7.5_
  
  - [ ] 10.2 Implement transaction form event handler
    - Add event listener for transaction form submission
    - Extract form data (amount, category, description, date)
    - Call transaction validation
    - Display validation errors if invalid
    - Clear errors and add transaction if valid
    - Reset form after successful submission
    - Update UI (list, chart, summary)
    - _Requirements: 1.1, 1.6, 1.7, 10.1, 10.2, 10.4, 10.5, 10.6_
  
  - [ ] 10.3 Implement transaction deletion event handler
    - Add event listener for delete buttons (use event delegation)
    - Extract transaction ID from clicked button
    - Delete transaction via TransactionManager
    - Update UI (list, chart, summary)
    - _Requirements: 1.3_
  
  - [ ] 10.4 Implement budget update event handler
    - Add event listener for budget form submission
    - Extract budget amount
    - Call budget validation
    - Display validation error if invalid
    - Update budget if valid
    - Update summary display
    - _Requirements: 3.1, 3.3, 3.4, 10.3, 10.4, 10.5_
  
  - [ ] 10.5 Implement theme toggle event handler
    - Add event listener for theme toggle button
    - Call ThemeManager.toggle()
    - Apply new theme to DOM
    - _Requirements: 6.1, 6.2_

- [ ] 11. Implement UI rendering methods
  - [ ] 11.1 Implement transaction list rendering
    - Create renderTransactionList() method
    - Clear existing list
    - Get sorted transactions from TransactionManager
    - Create DOM elements for each transaction showing date, category, description, amount, and delete button
    - Format amount with currency symbol and +/- sign
    - Display category name
    - Append to transaction list container
    - _Requirements: 1.2, 1.4, 2.4_
  
  - [ ] 11.2 Implement summary rendering
    - Create renderSummary() method
    - Get current month/year
    - Call SummaryCalculator.calculateSummary()
    - Update DOM elements for total income, total expenses, remaining budget
    - Apply warning styling (red text) if isOverBudget is true
    - Apply normal styling otherwise
    - _Requirements: 5.1, 5.5, 5.6_
  
  - [ ] 11.3 Implement chart rendering integration
    - Create renderChart() method
    - Get current month transactions
    - Filter to only expenses
    - Call ChartRenderer.render() with expense transactions
    - Show empty state if no expenses exist
    - _Requirements: 4.1, 4.4, 4.5_
  
  - [ ] 11.4 Implement master updateUI() method
    - Create updateUI() method that calls all render methods
    - Call renderTransactionList()
    - Call renderChart()
    - Call renderSummary()
    - This method is called after any data change
    - _Requirements: 1.5, 3.4, 4.5, 5.7_
  
  - [ ]* 11.5 Write property tests for UI update triggers
    - **Property 4: Transaction Changes Update Summary**
    - **Property 11: Budget Changes Update Summary**
    - **Property 14: Transaction Changes Update Chart**
    - **Validates: Requirements 1.5, 3.4, 4.5, 5.7**

- [ ] 12. Implement error display system
  - [ ] 12.1 Create error display methods
    - Create displayError() method to show validation errors near inputs
    - Create clearErrors() method to remove all error messages
    - Use red text or border styling for errors
    - Call clearErrors() before each validation attempt
    - _Requirements: 10.6_
  
  - [ ]* 12.2 Write property test for form validation blocking
    - **Property 25: Form Submission Blocking on Validation Errors**
    - **Property 26: Error Message Clearing on Valid Submission**
    - **Validates: Requirements 10.4, 10.5**

- [ ] 13. Add performance optimizations and final touches
  - [ ] 13.1 Add visual feedback for user interactions
    - Add button hover states
    - Add button active/pressed states
    - Add loading indicators if needed
    - Ensure all operations complete within specified time limits (< 100ms for most, < 200ms for chart)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ] 13.2 Implement date input default value
    - Set transaction date input to current date by default
    - Format as YYYY-MM-DD
  
  - [ ] 13.3 Add number input step and min attributes
    - Set step="0.01" for amount input (support cents)
    - Add appropriate input types (number for amounts, date for dates)

- [ ] 14. Final checkpoint - Complete testing and validation
  - Test all user flows: add transaction, delete transaction, set budget, toggle theme
  - Verify data persistence by reloading page
  - Verify monthly summary calculations with transactions in different months
  - Verify pie chart rendering with various category distributions
  - Verify theme toggle persistence
  - Verify validation error displays
  - Test storage unavailable scenario (disable localStorage in browser)
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The application uses vanilla JavaScript only - no frameworks or external libraries
- All data persistence uses browser localStorage with JSON serialization
- The pie chart must be rendered using native Canvas API without charting libraries
- Theme system uses CSS variables with data-theme attribute switching
- Form validation should prevent submission and display clear error messages
- All UI updates should happen automatically when data changes
- Transaction list must always show newest transactions first
- Monthly summary only includes transactions from the current calendar month
- Pie chart only includes expense transactions (negative amounts), not income

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "2.3"] },
    { "id": 2, "tasks": ["2.2", "3.1"] },
    { "id": 3, "tasks": ["3.2", "4.1"] },
    { "id": 4, "tasks": ["3.3", "3.4", "3.5", "3.6", "4.2", "6.1"] },
    { "id": 5, "tasks": ["6.2", "7.1", "8.1", "9.1"] },
    { "id": 6, "tasks": ["7.2", "8.2", "10.1"] },
    { "id": 7, "tasks": ["10.2", "10.3", "10.4", "10.5"] },
    { "id": 8, "tasks": ["11.1", "11.2", "11.3"] },
    { "id": 9, "tasks": ["11.4"] },
    { "id": 10, "tasks": ["11.5", "12.1"] },
    { "id": 11, "tasks": ["12.2", "13.1", "13.2", "13.3"] }
  ]
}
```
