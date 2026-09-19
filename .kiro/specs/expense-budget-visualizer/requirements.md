# Requirements Document

## Introduction

The Expense & Budget Visualizer is a web application that enables users to track financial transactions, categorize expenses, visualize spending patterns through pie charts, view monthly summaries, and toggle between light and dark themes. The application must be implemented using vanilla JavaScript with a single CSS file in the css/ directory and a single JavaScript file in the js/ directory, without any frameworks or libraries.

## Glossary

- **Application**: The Expense & Budget Visualizer web application
- **Transaction**: A financial record containing an amount, category, description, and date
- **Category**: A classification label for transactions (e.g., Food, Transport, Entertainment, Utilities, Other)
- **Expense**: A transaction with a negative monetary value
- **Income**: A transaction with a positive monetary value
- **Budget**: The total planned spending limit set by the user
- **Pie_Chart**: A circular statistical graphic displaying category spending distribution
- **Monthly_Summary**: A report showing total income, total expenses, and remaining budget for the current month
- **Theme**: The visual appearance mode of the application (light or dark)
- **Transaction_Form**: The user interface component for inputting new transaction data
- **Storage_System**: The browser's localStorage mechanism for persisting data

## Requirements

### Requirement 1: Transaction Management

**User Story:** As a user, I want to add, view, and delete transactions, so that I can track my financial activities accurately.

#### Acceptance Criteria

1. WHEN the user submits the Transaction_Form with amount, category, description, and date, THE Application SHALL create a new Transaction with the provided data
2. WHEN a Transaction is created, THE Application SHALL display the Transaction in the transaction list immediately
3. WHEN the user clicks the delete button on a Transaction, THE Application SHALL remove the Transaction from the list
4. THE Application SHALL display all Transactions in reverse chronological order (newest first)
5. WHEN a Transaction is added or deleted, THE Application SHALL update the Monthly_Summary automatically
6. THE Application SHALL validate that the amount field contains a numeric value before creating a Transaction
7. THE Application SHALL validate that all required fields (amount, category, date) are filled before creating a Transaction

### Requirement 2: Category Management

**User Story:** As a user, I want to assign categories to my transactions, so that I can organize and analyze my spending by type.

#### Acceptance Criteria

1. THE Application SHALL provide predefined categories: Food, Transport, Entertainment, Utilities, and Other
2. WHEN the user creates a Transaction, THE Application SHALL require selection of one Category
3. THE Application SHALL associate each Transaction with exactly one Category
4. WHEN displaying Transactions, THE Application SHALL show the assigned Category for each Transaction
5. THE Application SHALL use Category data to calculate spending distribution for the Pie_Chart

### Requirement 3: Budget Setting

**User Story:** As a user, I want to set a monthly budget, so that I can monitor my spending against my financial goals.

#### Acceptance Criteria

1. THE Application SHALL provide an input field for setting the Budget amount
2. WHEN the user enters a Budget amount, THE Application SHALL store the Budget value
3. THE Application SHALL validate that the Budget amount is a positive numeric value
4. WHEN the Budget is set or updated, THE Application SHALL recalculate the Monthly_Summary immediately
5. THE Application SHALL persist the Budget value in the Storage_System

### Requirement 4: Pie Chart Visualization

**User Story:** As a user, I want to see a pie chart of my expenses by category, so that I can visualize my spending patterns.

#### Acceptance Criteria

1. THE Application SHALL render a Pie_Chart displaying expense distribution by Category
2. WHEN Transactions exist, THE Pie_Chart SHALL calculate the percentage of total expenses for each Category
3. THE Application SHALL display each Category segment with a distinct color in the Pie_Chart
4. WHEN no Transactions exist, THE Application SHALL display an empty or placeholder Pie_Chart
5. WHEN a Transaction is added or deleted, THE Application SHALL update the Pie_Chart automatically
6. THE Application SHALL render the Pie_Chart using HTML5 Canvas or SVG without external charting libraries
7. THE Application SHALL include only Expense transactions in the Pie_Chart calculation (exclude Income)

### Requirement 5: Monthly Summary

**User Story:** As a user, I want to see a monthly summary of my finances, so that I can track my total income, expenses, and remaining budget.

#### Acceptance Criteria

1. THE Application SHALL display the Monthly_Summary showing total income, total expenses, and remaining budget
2. WHEN calculating total income, THE Application SHALL sum all positive Transaction amounts for the current month
3. WHEN calculating total expenses, THE Application SHALL sum all negative Transaction amounts for the current month
4. THE Application SHALL calculate remaining budget as: Budget minus total expenses
5. WHEN the remaining budget is negative, THE Application SHALL display the value in red or with a warning indicator
6. WHEN the remaining budget is positive or zero, THE Application SHALL display the value normally
7. WHEN Transactions are added or deleted, THE Application SHALL recalculate the Monthly_Summary immediately
8. THE Application SHALL filter Transactions by the current calendar month for Monthly_Summary calculations

### Requirement 6: Theme Toggle

**User Story:** As a user, I want to toggle between light and dark themes, so that I can use the application comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Application SHALL provide a theme toggle control (button or switch)
2. WHEN the user clicks the theme toggle, THE Application SHALL switch between light and dark Theme modes
3. WHEN dark Theme is active, THE Application SHALL apply dark background colors and light text colors
4. WHEN light Theme is active, THE Application SHALL apply light background colors and dark text colors
5. THE Application SHALL persist the selected Theme preference in the Storage_System
6. WHEN the Application loads, THE Application SHALL restore the previously selected Theme from the Storage_System
7. WHERE no Theme preference is stored, THE Application SHALL default to light Theme

### Requirement 7: Data Persistence

**User Story:** As a user, I want my transactions and settings to be saved automatically, so that I don't lose my data when I close the browser.

#### Acceptance Criteria

1. WHEN a Transaction is created or deleted, THE Application SHALL save all Transactions to the Storage_System
2. WHEN the Budget is set or updated, THE Application SHALL save the Budget value to the Storage_System
3. WHEN the Application loads, THE Application SHALL restore all Transactions from the Storage_System
4. WHEN the Application loads, THE Application SHALL restore the Budget value from the Storage_System
5. IF the Storage_System is unavailable, THEN THE Application SHALL display a warning message to the user
6. THE Application SHALL use JSON format for serializing data in the Storage_System

### Requirement 8: File Structure Constraints

**User Story:** As a developer, I want the application to follow a specific file structure, so that the codebase remains organized and maintainable.

#### Acceptance Criteria

1. THE Application SHALL contain exactly one CSS file located in the css/ directory
2. THE Application SHALL contain exactly one JavaScript file located in the js/ directory
3. THE Application SHALL use vanilla JavaScript without any frameworks or external libraries
4. THE Application SHALL not include any framework-specific code (e.g., React, Vue, Angular)
5. WHERE the Pie_Chart requires rendering, THE Application SHALL use native HTML5 Canvas or SVG APIs
6. THE Application SHALL include an HTML file that references the single CSS file and single JavaScript file

### Requirement 9: User Interface Responsiveness

**User Story:** As a user, I want the application to respond immediately to my actions, so that I have a smooth user experience.

#### Acceptance Criteria

1. WHEN the user submits the Transaction_Form, THE Application SHALL display the new Transaction within 100ms
2. WHEN the user deletes a Transaction, THE Application SHALL remove it from the display within 100ms
3. WHEN the user toggles the Theme, THE Application SHALL apply the new Theme within 100ms
4. WHEN the user updates the Budget, THE Application SHALL recalculate and display the updated Monthly_Summary within 100ms
5. THE Application SHALL provide visual feedback for all user interactions (button clicks, form submissions)

### Requirement 10: Input Validation and Error Handling

**User Story:** As a user, I want clear feedback when I enter invalid data, so that I can correct my mistakes easily.

#### Acceptance Criteria

1. WHEN the user submits the Transaction_Form with empty required fields, THE Application SHALL display an error message
2. WHEN the user enters a non-numeric value in the amount field, THE Application SHALL display an error message
3. WHEN the user enters a negative value for the Budget, THE Application SHALL display an error message
4. THE Application SHALL prevent form submission when validation errors exist
5. WHEN validation succeeds, THE Application SHALL clear any previous error messages
6. THE Application SHALL display error messages in a visually distinct manner (e.g., red text, border highlight)
