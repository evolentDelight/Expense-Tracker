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
    return [false, err];
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
    return [false, err];
  }
}

function writeToJSONDataFile(jsonArray){
  const filePath = path.join(import.meta.dirname, 'data/expenses.json');
  const jsonData = JSON.stringify(jsonArray, null, 2);

  try{
    fs.writeFileSync(filePath, jsonData, 'utf8')
    return [true]
  } catch(err){
    return [false, err];
  }
}

function doesDataFileExists(){//helper function for detecting if file exists
  if(fs.existsSync(path.join(import.meta.dirname, 'data/expenses.json'))) return true;
  else return false;
}

function getUniqueId(){//get Unique ID based on existing expenses
  let [jsonArray, errorMessageJSON] = retrieveJSONFromDataFile();
  if(errorMessageJSON) return [false, `JSON Read Failed: ${errorMessageJSON}`];//If there is an error returnMessage, propagate to program.error message
  
  if(jsonArray.length === 0) return [1];//If the expenses list is empty, return 1 as next ID

  let highestID = Math.max(...(jsonArray.map(item => item.id)));

  return [++highestID];
}

function doesExpenseIdExist(id){
  let [jsonArray, errorMessageJSON] = retrieveJSONFromDataFile();
  if(errorMessageJSON) return [false, `JSON Read Failed: ${errorMessageJSON}`];

  if(jsonArray.length === 0) return [false];

  const exists =  jsonArray.some(expense => expense.id === id);

  return [exists];
}

export function getExpense(type, month = -1){//type: list, summary, summary by month

}

export function createExpense(description, amount){//each main command returns a Message - e.g. 'Expense added successfully (ID: 1)
  if(!doesDataFileExists()) {
    const [hasSucceeded, errorMessage] = createDataFile();
    if(!hasSucceeded) return [hasSucceeded, `FileSystem Operation Failed: ${errorMessage}`];
  }

  const [ID, errorMessageID] = getUniqueId();
  if(errorMessageID) return [false, `ID Read Failed: ${errorMessageID}`];

  //Create new array of json Objects
  let [jsonArray, errorMessageJSON] = retrieveJSONFromDataFile();
  if(errorMessageJSON) return [false, `JSON Read Failed: ${errorMessageJSON}`];
  
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
  if(errorMessageWrite) return [false, `Creating Expense [${ID}, ${description}, ${amount}] failed: ${errorMessageWrite}`];

  return [true, `Expense added successfully (ID: ${ID})`]
}

export function deleteExpense(id){//delete an expense by id

}