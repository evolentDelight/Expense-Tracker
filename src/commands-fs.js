import * as fs from 'node:fs';
import * as path from 'node:path';
import Table from 'cli-table3';
import { json2csv } from 'json-2-csv';

// Handles all file system related processing.

const mainPath = path.join(import.meta.dirname, '..');

function createDataFile(){
  const dirPath = path.join(mainPath, 'data');
  const filePath = path.join(dirPath, 'expenses.json');

  try{
    //First create directory
    fs.mkdirSync(dirPath, { recursive: true });

    //Create json file
    fs.writeFileSync(filePath, '[]', 'utf-8');
  } catch(err){
    return [false, `File System Create Operation Failed: ${err}`];
  }
  return [true];
}

function retrieveJSONFromDataFile(){
  const filePath = path.join(mainPath, 'data/expenses.json');
  try{
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonObject = JSON.parse(data);
    return [jsonObject]
  } catch(err){
    return [false, `JSON Read Failed: ${err}`];
  }
}

function writeToJSONDataFile(jsonArray){
  const filePath = path.join(mainPath, 'data/expenses.json');
  const jsonData = JSON.stringify(jsonArray, null, 2);

  try{
    fs.writeFileSync(filePath, jsonData, 'utf8')
    return [true]
  } catch(err){
    return [false, `JSON Write Failed: ${err}`];
  }
}

function writeToCSV(csvString){
  const filePath = path.join(mainPath, 'data/expenses.csv');
  try{
    fs.writeFileSync(filePath, csvString, 'utf8')
    return [true]
  } catch (err){
    return [false, `CSV Write Failed: ${err}`];
  }
}

function doesDataFileExists(){//helper function for detecting if file exists
  if(fs.existsSync(path.join(mainPath, 'data/expenses.json'))) return true;
  else return false;
}

function getUniqueId(){//get Unique ID based on existing expenses
  let [jsonArray, errorMessageJSON] = retrieveJSONFromDataFile();
  if(errorMessageJSON) return [false, `ID Read Failed: ${errorMessageJSON}`];//If there is an error returnMessage, propagate to program.error message
  
  if(jsonArray.length === 0) return [1];//If the expenses list is empty, return 1 as next ID

  let highestID = Math.max(...(jsonArray.map(item => item.id)));

  return [++highestID];
}

function doesExpenseIdExist(id){//Helper function to check if an expense with <ID> exists. returns boolean
  let [jsonArray, errorMessageJSON] = retrieveJSONFromDataFile();
  if(errorMessageJSON) return [false, `${errorMessageJSON}`];

  if(jsonArray.length === 0) return [false];

  const exists = jsonArray.some(expense => expense.id === id);

  return [exists];
}

function convertJSONtoCSV(jsonArray){
  try{
    const csv = json2csv(jsonArray)
    return [true, csv]
  } catch(err){
    return [false, `Conversion from JSON to CSV failed: ${err}`]
  }
}

export function getList(){//Get a complete list of expenses
  const headerErrorList = `Getting List failed ::`;

  let [jsonArray, errorMessageJSON] = retrieveJSONFromDataFile();
  if(errorMessageJSON) return [false, `${headerErrorList} ${errorMessageJSON}`];

  let table = new Table({
    head: ['ID', 'Date', 'Description', 'Amount'],
    style:{
      head: ['brightCyan', 'bold'],
      border: ['white'],
    }
  })

  jsonArray.forEach(expense => {
    table.push([
      `\x1b[92m${expense.id}\x1b[0m`,//Bright green ANSI code
      `${new Date(expense['Date Created']).toDateString()}`,
      expense.description,
      expense.amount
    ])
  })

  return [true, table.toString()]
}

export function getSummary(month = 0){//Get summary of expenses. Can optionally be viewed by month of current year
  let headerErrorSummary = `Getting Summary `;

  let [jsonArray, errorMessageJSON] = retrieveJSONFromDataFile();
  if(errorMessageJSON) return [false, `${headerErrorSummary} failed :: ${errorMessageJSON}`];

  if(jsonArray.length === 0 ) return[true, 'There is no expense in the system']

  if(month){
    let monthArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    //Separate expenses by year
    const groupedByYearMonth = jsonArray.reduce((accumulator, currentObject) =>{
      const date = new Date(currentObject['Date Created'])
      const year = date.getFullYear();
      const expenseMonth = date.getMonth();

      //If the array for the year and month doesn't exist, create it
      if(!accumulator[year] && expenseMonth === (month-1)){
        accumulator[year] = {
          month : expenseMonth,
          sum : 0
        }
      }

      if(expenseMonth === (month-1)) accumulator[year].sum += currentObject.amount;

      return accumulator;
    }, {});

    //Create CLI output string
    let items = [];

    Object.keys(groupedByYearMonth).forEach(year =>{
      items.push(`Total expenses for ${monthArray[month-1]} ${year}: $${groupedByYearMonth[year].sum}`)
    })

    let result = '';

    if(items.length === 0) result = `No expenses for ${monthArray[month-1]} for all years`
    else result = items.join("\n")

    return [true, result]
  }

  // General Summary

  //Separate expenses by year
  const groupedByYear = jsonArray.reduce((accumulator, currentObject) =>{
    const year = new Date(currentObject['Date Created']).getFullYear();

    //If the array for the year doesn't exist, create it
    if(!accumulator[year]){
      accumulator[year] = {
        sum : 0
      }
    }

    accumulator[year].sum += currentObject.amount;

    return accumulator;
  }, {});

  let items = [];

  Object.keys(groupedByYear).forEach(year => {
    items.push(`Total expenses for ${year}: $${groupedByYear[year].sum}`)
  })

  let result = '';

  if(items.length === 0) result = `There is no expense in the system`
  else result = items.join('\n')

  return [true, result]
}

export function createExpense(description, amount){//each main command returns a Message - e.g. 'Expense added successfully (ID: 1)
  const headerErrorCreate = `Creating Expense [${description}, ${amount}] failed ::`
  
  if(!doesDataFileExists()) {
    const [hasSucceeded, errorMessage] = createDataFile();
    if(!hasSucceeded) return [hasSucceeded, `${headerErrorCreate} ${errorMessage}`];
  }

  const [ID, errorMessageID] = getUniqueId();
  if(errorMessageID) return [false, `${headerErrorCreate} ${errorMessageID}`];

  //Create new array of json Objects
  let [jsonArray, errorMessageJSON] = retrieveJSONFromDataFile();
  if(errorMessageJSON) return [false, `${headerErrorCreate} ${errorMessageJSON}`];
  
  const dateCreated = new Date();
  
  const expense = {
    id: ID,
    description: description,
    amount: amount,
    'Date Created': dateCreated,
    'Date Modified': dateCreated
  }

  jsonArray.push(expense);

  const [writeSuccessful, errorMessageWrite] = writeToJSONDataFile(jsonArray);
  if(errorMessageWrite) return [false, `${headerErrorCreate} ${errorMessageWrite}`];

  return [true, `Expense added successfully (ID: ${ID})`]
}

export function deleteExpense(id){//delete an expense by id
  const headerErrorDelete = `Deleting Expense with <ID>: [${id}] Failed ::`;
  /*
    Originally, checking if the JSON data file existed was going to be checked, but due to the simplicity
      of the app, such check will not be done.
    i.e. doesDataFileExists()
  */
  const [exists, errorMessageID] = doesExpenseIdExist(id);
  if(errorMessageID) return [false, `${headerErrorDelete} Unexpected Error: ${errorMessageID}`];//check for fs related issue
  if(!exists) return [false, `${headerErrorDelete} Expense with <ID>: [${id}] does not exist.`];//check if ID exists

  let [jsonArray, errorMessageJSON] = retrieveJSONFromDataFile();
  if(errorMessageJSON) return [false, `${headerErrorDelete} ${errorMessageJSON}`];
  const newArray = jsonArray.filter(jsonObject => jsonObject.id !== id);

  const [writeSuccessful, errorMessageWrite] = writeToJSONDataFile(newArray);
  if(errorMessageWrite) return [false, `${headerErrorDelete} ${errorMessageWrite}`];

  return [true, `Expense with (ID: ${id}) deleted successfully.`]
}

export function updateExpense(id, type, value){
  const headerErrorUpdate = `Updating Expense with <ID> [${id}] Failed ::`;

  const [exists, errorMessageID] = doesExpenseIdExist(id);
  if(errorMessageID) return [false, `${headerErrorUpdate} Unexpected Error: ${errorMessageID}`];
  if(!exists) return [false, `${headerErrorUpdate} Expense with <ID>: [${id}] does not exist.`];

  let [jsonArray, errorMessageJSON] = retrieveJSONFromDataFile();
  if(errorMessageJSON) return [false, `${headerErrorUpdate} ${errorMessageJSON}`];
  const newArray = jsonArray.map(expense => {
    if(expense.id === id){
      if(type === 'description'){
        expense.description = value;
      } else{
        expense.amount = value;
      }
      expense['Date Modified'] = new Date();
    }
    return expense;
  })

  const [writeSuccessful, errorMessageWrite] = writeToJSONDataFile(newArray);
  if(errorMessageWrite) return [false, `${headerErrorUpdate} ${errorMessageWrite}`];

  return [true, `Expense with (ID: ${id}) updated successfully`];
}

export function exportCSV(){
  const headerErrorExportCSV = 'Exporting to CSV Failed ::'

  let [jsonArray, errorMessageJSON] = retrieveJSONFromDataFile();
  if(errorMessageJSON) return [false, `${headerErrorExportCSV} ${errorMessageJSON}`];

  if(jsonArray.length === 0) return [true, 'There is no expense in the system']

  let [conversionSuccessful, stringCSVorError] = convertJSONtoCSV(jsonArray);
  if(!conversionSuccessful) return [false, `${headerErrorExportCSV} ${stringCSVorError}`]

  let [writeSuccessful, errorMessageWrite] = writeToCSV(stringCSVorError);

  if(!writeSuccessful) return [false, `${headerErrorExportCSV} ${errorMessageWrite}`];

  return [true, `Export to CSV Succeeded`];
}