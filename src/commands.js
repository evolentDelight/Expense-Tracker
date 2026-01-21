import { Option } from 'commander';
import { createExpense, deleteExpense } from './commands-fs.js';

function escapeInvisibles(s) {
  return [...s].map(ch => {
    const cp = ch.codePointAt(0);
    if (cp === 0x200E || cp === 0x200F || (cp >= 0x202A && cp <= 0x202E) || (cp >= 0x2066 && cp <= 0x2069)) {
      return `\\u${cp.toString(16).toUpperCase().padStart(4, "0")}`;
    }
    return ch;
  }).join("");
}

function convertControlCharacters(s){
  return String(s).replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
}

function isValidDescription(description){
  //Check for control character[\n, \t, \r], before the trimmed. Can be caused by not closing double quotes during input in bash"
  if(/[\x00-\x1F\x7F]/.test(description)) return [false, `The entered <description>: "${convertControlCharacters(description)}" cannot contain control characters.`]
  const name = description.trim();
  if(!name) return [false, `The entered <description>: "${description}" cannot be empty or only whitespaces.`]
  if (/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/.test(name)){//test by $'\u200E'
    return [false, `The entered <description>: "${escapeInvisibles(description)}" cannot contain invisible directionality characters.`];
  }
  if(/\\(?:[nrt0]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|u\{[0-9a-fA-F]+\})/.test(name)) return [false, `The entered <description>: "${description}" cannot contain escape sequences like \\n, \\t, \\r, \\xNN, \\uNNNN.`]

  return [true]
}

function isValidMonetaryNumber(amount){//Input Validation: amount must be a valid monetary number
  const cost = +amount;
  if(!Number.isFinite(cost)) return [false, `The entered <amount>: [${amount}] is not a number.`];
  if(cost <= 0) return [false, `The entered <amount>: [${amount}] is equal to or below 0. Please enter an expense.`]
  const regex = /^\d+(?:\.\d{1,2})?$/;//Postive with at most two decimals
  if(!regex.test(cost)) return [false, `The entered <amount>: [${amount}] has more than two decimals. Please enter within two decimals.`]

  return [true]
}

function isValidExpenseID(id){
  if(id === null || id === undefined) return[false, `The entered <ID>: [${id}] cannot be null or undefined.`];
  //Check for control character[\n, \t, \r], before the trimmed. Can be caused by not closing double quotes during input in bash"
  if(/[\x00-\x1F\x7F]/.test(id)) return [false, `The entered <ID>: [${convertControlCharacters(id)}] cannot contain control characters.`];
  if(/\\(?:[nrt0]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|u\{[0-9a-fA-F]+\})/.test(id)) return [false, `The entered <ID: [${id}] cannot contain escape sequences like \\n, \\t, \\r, \\xNN, \\uNNNN.`]
  const trimmedID = String(id).trim();
  if(trimmedID === "") return[false, `The entered <ID>: [${id}] cannot be empty or just whitespaces.`]
  const checkID = +id;
  if(!Number.isFinite(checkID)) return [false, `The entered <ID>: [${id}] is not a number.`];
  if(checkID <= 0) return[false, `The entered <ID>: [${id}] cannot be 0 or a negative number.`];
  if(!Number.isInteger(checkID)) return [false, `The entered <ID>: [${id}] is not a whole number.`]

  return [true];
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
      const [isValidName, messageName] = isValidDescription(description);
      if(!isValidName) program.error(messageName);

      const [isValidNumber, messageNumber] = isValidMonetaryNumber(amount);
      if(!isValidNumber) program.error(messageNumber);

      const [createdSuccessfully, returnMessage] = createExpense(description.trim(), +amount);
      if(!createdSuccessfully) program.error(returnMessage);

      // created Successfully
      console.log(returnMessage);
    });

  // Command: Update (by id)
    program
    .command("update")
    .description("Update an expense description or amount by id")
    .argument("<New Description or Amount>", "Description or Amount to update to")
    .addOption(new Option('-t, --type <type>', 'Update description or amount by replacing <type> with a <description> or <amount>')
                          .choices(['d', 'description', 'a', 'amount'])
                          .makeOptionMandatory())
    .requiredOption("-i, --id <number>", "Choose the expense id to update")
    .action((input, {type, id}) => {
      const [isValidID, messageID] = isValidExpenseID(id);
      if(!isValidID) program.error(messageID);

      if(type === 'd' || type === 'description'){
        const [isValidName, messageName] = isValidDescription(input);
        if(!isValidName) program.error(messageName);
      }
      if(type === 'a' || type === 'amount'){
        const [isValidNumber, messageNumber] = isValidMonetaryNumber(input);
        if(!isValidNumber) program.error(messageNumber);
      }

      //Call updateExpense
    });

  // Command: Delete (by id)
  program
    .command('delete')
    .description("Delete an expense by id")
    .requiredOption('-i, --id <number>', 'The id of the expense to delete')
    .action(({id}) => {
      const [isValidID, messageID] = isValidExpenseID(id);
      if(!isValidID) program.error(messageID);

      const [deletedSuccessfully, returnMessage] = deleteExpense(+id);
      if(!deletedSuccessfully) program.error(returnMessage);

      // Deleted Successfully
      console.log(returnMessage);
    })

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