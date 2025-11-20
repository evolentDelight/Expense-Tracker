#!/usr/bin/env node
import { program } from "commander";

program
  .name("expense-tracker")
  .description("Command-Line Interface Application to manage expenses")
  .version("0.0.1", "-v, --version", "output the current version");

program.parse();
