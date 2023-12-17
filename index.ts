import { Conversation } from "./conversation";

async function main() {
  const defaultModel = "gpt-3.5-turbo-1106";
  const model = (await userInput(`model (${defaultModel}): `)) || defaultModel;
  const systemPrompt = await userInput("Enter a system prompt (optional): ");
  stdout("\n");
  stdout("Hello! Welcome to TermGPT.\n");
  stdout(`You are chatting with ${model}.\n`);
  stdout("Start typing and press Enter to get a response from the model.\n\n");
  const convo = new Conversation(model, systemPrompt);
  beginConversation(convo);
}

async function beginConversation(convo: Conversation) {
  stdout("[ME] ");

  // never-ending interactive prmopt https://bun.sh/guides/process/stdin
  for await (const line of console) {
    stdout("\n");

    // make sure user enters non-empty text
    if (!line.trim().length) {
      stdout("[CLI] must enter non-empty text");
      stdout("\n\n");
      stdout("[ME] ");
      continue;
    }

    stdout(`[ASSISTANT] `);
    await convo.streamNewResponse(line, stdout);
    stdout("\n\n");
    stdout("[ME] ");
  }
}

// one-shot read input from stdin.
async function userInput(prompt = "") {
  stdout(prompt);
  for await (const line of console) {
    return line;
  }
  return "";
}

const stdout = (s: string) => process.stdout.write(s);

main();
