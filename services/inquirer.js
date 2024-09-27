// init.mjs
import inquirer from "inquirer";
import PressToContinuePrompt from "inquirer-press-to-continue";

// Register the custom prompt
inquirer.registerPrompt("press-to-continue", PressToContinuePrompt);
