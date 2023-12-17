import { Conversation } from "./conversation";

async function main() {
  const model = "gpt-3.5-turbo";
  const convo = new Conversation(model);

  /**
   * conversating with {model}
   *
   * <me>
   * ...
   * </me>
   *
   * <{model}>
   * ...
   * </{model}>
   */

  console.log(
    `Hello! Welcome to TerminalGPT.\nYou are chatting with ${model}.\nStart typing and press Enter to get a response from the model.`
  );

  console.log("<me>");

  // never-ending interactive prmopt https://bun.sh/guides/process/stdin
  for await (const line of console) {
    // make sure user enters non-empty text
    if (line.trim().length === 0) {
      console.log("</me>");
      console.log(`<cli>must enter non-empty text</cli>\n`);
      console.log("<me>");
      continue;
    }

    const msg = await convo.sendMessage(line);
    console.log(`<${msg.role}>`);
    console.log(msg.content);
    console.log(`</${msg.role}>\n`);

    console.log("<me>");
  }
}

main();
