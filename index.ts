import chalk from "chalk";
import { Conversation } from "./conversation";

async function main() {
  const defaultModel = "gpt-3.5-turbo-1106";
  const model =
    (await userInput(`model ${chalk.gray(`(${defaultModel})`)}: `)) ||
    defaultModel;
  const systemPrompt = await userInput(
    `system prompt ${chalk.gray("(optional)")}: `
  );
  stdout("\n");
  stdout("Hello! Welcome to TermGPT.\n");
  stdout(`You are chatting with ${chalk.magentaBright(model)}.\n`);
  stdout("Start typing and press Enter to get a response from the model.\n\n");
  const convo = new Conversation(model, systemPrompt);
  await beginConversation(convo);
}

async function beginConversation(convo: Conversation) {
  const COLOR_ME = chalk.green;
  const COLOR_ASSISTANT = chalk.gray;
  const COLOR_ERROR = chalk.red;

  stdout("[ME] ", COLOR_ME);

  // never-ending interactive prmopt https://bun.sh/guides/process/stdin
  for await (const line of console) {
    stdout("\n");

    // make sure user enters non-empty text
    if (!line.trim().length) {
      stdout("[CLI] must enter non-empty text", COLOR_ERROR);
      stdout("\n\n");
      stdout("[ME] ", COLOR_ME);
      continue;
    }

    stdout(`[ASSISTANT] `, COLOR_ASSISTANT);
    try {
      await convo.streamNewResponse(line, stdout);
    } catch (e) {
      stdout("[CLI-ERROR] " + (e as Error).message, COLOR_ERROR);
    }
    stdout("\n\n");
    stdout("[ME] ", COLOR_ME);
  }
}

// one-shot read input from stdin.
async function userInput(prompt = "") {
  stdout(prompt);
  for await (const line of console) {
    return line;
  }
}

const stdout = (s: string, pre?: (s: string) => string) => {
  process.stdout.write(pre ? pre(s) : s);
};

// await is important to keep prompt open forever (until user ctrl+c's out)
await main();
