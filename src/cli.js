import { Command } from "commander";
import { registerCommands } from "./commands.js"

function createProgram(){
  const program = new Command();

  program
  .name("expense-tracker")
  .description("Command-Line Interface Application to manage expenses")
  .version("0.0.1", "-v, --version", "output the current version");

  registerCommands(program);

  return program;
}

export function run(argv = process.argv){
  const program = createProgram();

  program.parse(argv);
}