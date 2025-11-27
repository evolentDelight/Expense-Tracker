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

program.parse();
