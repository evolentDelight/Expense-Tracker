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
    fs.writeFileSync(filePath, '{}', 'utf-8');
  } catch(err){
    return [false, err];
  }
  return [true];
}

function doesDataFileExists(){//helper function for detecting if file exists
  if(fs.existsSync('./data/expenses.json')) return true;
  else return false;
}

function getUniqueId(){//get Unique ID based on existing expenses

}

export function getExpense(type, month = -1){//type: list, summary, summary by month

}

export function createExpense(description, amount){//each main command returns a Message - e.g. 'Expense added successfully (ID: 1)
  if(!doesDataFileExists()) {
    const [hasSucceeded, errorMessage ] = createDataFile();
    if(!hasSucceeded) return [hasSucceeded, `FileSystem Operation Failed: ${errorMessage}`];
  }

  return [true, 'returnMessage']
}

export function deleteExpense(id){//delete an expense by id

}