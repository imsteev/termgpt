import { Conversation } from "./conversation";

async function main() {
  const model = "gpt-3.5-turbo";
  const convo = new Conversation(model);

  /**
   * conversating with {model}
   *
   * [ME]
   * ...
   *
   * [CLI] (in case there are input errors)
   *
   * [{model}]
   * ...
   */

  console.log(
    `Hello! Welcome to TerminalGPT.\nYou are chatting with ${model}.\nStart typing and press Enter to get a response from the model.`
  );

  process.stdout.write("[ME] ");

  // never-ending interactive prmopt https://bun.sh/guides/process/stdin
  // TODO: clean this up to make it easier to understand...
  for await (const line of console) {
    // make sure user enters non-empty text
    if (line.trim().length === 0) {
      process.stdout.write(`\n[CLI] must enter non-empty text`);
      process.stdout.write("\n\n[ME] ");
      continue;
    }

    const msg = await convo.sendMessage(line);
    process.stdout.write(`\n[${msg.role.toLocaleUpperCase()}] ${msg.content}`);
    process.stdout.write("\n\n[ME] ");
  }
}

main();
