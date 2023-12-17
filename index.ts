import { Conversation } from "./conversation";

const GPT_3_5_1106 = "gpt-3.5-turbo-1106";

const stdout = (s: string) => process.stdout.write(s);

async function main() {
  const model = await getModelOrDefault(GPT_3_5_1106);
  const systemPrompt = await getSystemPrompt();
  stdout("\n");
  stdout("Hello! Welcome to TermGPT.\n");
  stdout(`You are chatting with ${model}.\n`);
  stdout("Start typing and press Enter to get a response from the model.\n\n");
  beginConversation(model, systemPrompt);
}

/**
 * [ME]
 * ...
 *
 * [CLI] (in case there are input errors)
 *
 * [{model}]
 * ...
 *
 */
async function beginConversation(model: string, systemPrompt?: string) {
  const convo = new Conversation(model, systemPrompt);

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

async function getSystemPrompt() {
  stdout("Enter a system prompt (optional): \n");
  return await userInput();
}

async function getModelOrDefault(defaultModel: string) {
  stdout("Choose the OpenAI model you'd like to chat with\n");
  stdout(`model (${defaultModel}): `);
  return (await userInput()) || defaultModel;
}

// one-shot read input from stdin.
const userInput = async () => {
  for await (const line of console) {
    return line;
  }
};

main();
