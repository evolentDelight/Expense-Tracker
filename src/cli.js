import { Command } from "commander";
import { registerCommands } from "./commands.js"

function errorColor(str){
  return `\x1b[31m${str}\x1b[0m`;
}
function createProgram(){
  const program = new Command();

  program
  .name("expense-tracker")
  .description("Command-Line Interface Application to manage expenses")
  .version("0.0.1", "-v, --version", "output the current version");

  registerCommands(program);

  program.configureOutput({
    writeErr: (str) => {
      process.stderr.write(`${errorColor(`[ERROR]`)} : ${str}`)
    }
  })

  return program;
}


export function run(argv = process.argv){
  const program = createProgram();

  program.parse(argv);
  
}