#!/usr/bin/env node
import { program } from "commander";

program
  .name("expense-tracker")
  .description("Command-Line Interface Application to manage expenses")
  .version("0.0.1", "-v, --version", "output the current version");

// Command: Add
program
  .command("add")
  .description("Add an expense into the tracker")
  .requiredOption(
    "-d, --description <name>",
    "Assign a description or name of the expense"
  )
  .requiredOption("-a, --amount <number>", "Add an amount, cost, or expense")
  .action(({ description, amount }) => {
    console.log("Description: ", description);
    console.log("Amount: ", amount);
  });

// Command: Update (by id)
program
  .command("update")
  .description("Update an expense description or amount by id")
  .argument("<string>", "String or Number to update the type")
  .requiredOption(
    "-t, --type <type>",
    "Update type by replacing <type> with a <description> or <amount>"
  )
  .requiredOption("-i, --id <number>", "Choose the expense id to update")
  .action((string, options) => console.log(string, options));

// Command: Delete (by id)
program
  .command('delete')
  .description("Delete an expense by id")
  .requiredOption('-i, --id <number>', 'The id of the expense to delete')
  .action(({id}) => console.log('ID: ', id))

// Command: List
program
  .command('list')
  .description('View complete list of expenses')
  .action(() => console.log('Activated list function'))

// Command: Summary
program
  .command('summary')
  .description('View total sum of expenses. Can be by month')
  .option('-m, --month <number>', 'The month to view total sum of expenses')
  .action(({month}) => console.log(month))

program.parse();
