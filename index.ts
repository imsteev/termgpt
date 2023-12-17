import { Conversation } from "./conversation";

const GPT_3_5_1106 = "gpt-3.5-turbo-1106";

const stdout = (s: string) => process.stdout.write(s);

async function main() {
  const model = await getModelOrDefault(GPT_3_5_1106);
  stdout("\n");
  stdout("Hello! Welcome to TermGPT.\n");
  stdout(`You are chatting with ${model}.\n`);
  stdout("Start typing and press Enter to get a response from the model.\n\n");
  beginConversation(model);
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
async function beginConversation(model: string) {
  const convo = new Conversation(model);

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

async function getModelOrDefault(defaultModel: string) {
  stdout("Choose the OpenAI model you'd like to chat with.\n");
  stdout(`model (${defaultModel}): `);

  // one-shot user prompt
  for await (const line of console) {
    if (line) {
      return defaultModel;
    }
    break;
  }

  return defaultModel;
}

main();
