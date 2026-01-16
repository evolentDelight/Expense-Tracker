# Expense-Tracker

A simple expense tracker to manage your finances

### ToDo

- Add global persistent data text file
  - so user won't have to look for it during uninstallation
- Create an uninstallation script that unlinks and deletes persistent data text file
  - And installation script over non-user-friendly "npm link"
- Learn npm package: commander for CLI
-

#### Notes
- backslash character can only be detected via escaping it and wrapping it in quotes('' or "")
  - User must be informed to not use backslash character to prevent autoremoval due to bash shell autoremoval.

- Prevent the user from editing the json file: data/expenses.json
  - This presents as a critical point of failure, including security issues
  - Thus, the solution is to request that the json file: expenses.json to not be tampered with
  - For this simple project, it is not necessary to create security and validation measures, and instead it will have a simple read/write mode.
    - For future project that has a backend server, there will be security measurement implemented with validation.