import * as fs from 'node:fs';
import * as path from 'node:path';

// Handles all file system related processing.

function createDataFile(){
  const dirPath = path.join(import.meta.dirname, 'data');
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
  const filePath = path.join(import.meta.dirname, 'data/expenses.json');
  try{
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonObject = JSON.parse(data);
    return [jsonObject]
  } catch(err){
    return [false, `JSON Read Failed: ${err}`];
  }
}

function writeToJSONDataFile(jsonArray){
  const filePath = path.join(import.meta.dirname, 'data/expenses.json');
  const jsonData = JSON.stringify(jsonArray, null, 2);

  try{
    fs.writeFileSync(filePath, jsonData, 'utf8')
    return [true]
  } catch(err){
    return [false, `JSON Write Failed: ${err}`];
  }
}

function doesDataFileExists(){//helper function for detecting if file exists
  if(fs.existsSync(path.join(import.meta.dirname, 'data/expenses.json'))) return true;
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

export function getList(){//Get a complete list of expenses

}

export function getSummary(month = -1){//Get summary of expenses. Can optionally be viewed by month of current year

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
  if(errorMessageJSON) return [false, `${headerErrorDelete} ${errorMessageJSON}`];
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
  if(errorMessageWrite) return [false, `${headerErrorDelete} ${errorMessageWrite}`];

  return [true, `Expense with (ID: ${id}) updated successfully`];
}