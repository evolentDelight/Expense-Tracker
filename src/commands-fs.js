import * as fs from 'node:fs';

// Handles all file system related processing.

function createDataFile(){
  
}

function doesDataFileExists(){//helper function for detecting if file exists

}

function getUniqueId(){//get Unique ID based on existing expenses

}

export function getExpense(type, month = -1){//type: list, summary, summary by month

}

export function createExpense(description, amount){
  if(!doesDataFileExists()) createDataFile();
}

export function deleteExpense(id){//delete an expense by id

}