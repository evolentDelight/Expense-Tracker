import { createExpense } from './commands-fs.js';

// Add Action logic functions
function commandAdd(description, amount){
  
}

function hasAtMostTwoDecimals(value){//Number validation for at most two decimals
  const regex = /^-?\d+(?:\.\d{1,2})?$/;
  return regex.test(value);
}

export function registerCommands(program){// program refers to Commander's program
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
      //Input Validation: amount must be a valid monetary number
      const cost = +amount;
      if(!Number.isFinite(cost)) program.error('The entered <amount> is not a number.');
      if(cost <= 0) program.error('The entered <amount> is equal to or below 0. Please enter an expense.');
      if(!hasAtMostTwoDecimals(cost)) program.error('The entered <amount> has more than two decimals. Please enter within two decimals.')

      program.error('testing')
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
    .description('View total sum of expenses. Can view by month')
    .option('-m, --month <number>', 'The month to view total sum of expenses')
    .action(({month}) => console.log(month))
}