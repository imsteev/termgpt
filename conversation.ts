import OpenAI from "openai";

// gets API Key from environment variable OPENAI_API_KEY
const openai = new OpenAI();

type Message = Pick<OpenAI.ChatCompletionMessageParam, "content" | "role">;

export class Conversation {
  _model!: string;
  _messages!: Message[];

  constructor(model: string, stream = false) {
    this._model = model;
    this._messages = [];
  }

  // TODO: handle errors
  async streamNewResponse(content: string, writeChunk?: (s: string) => void) {
    // shallow copy so that we do not prematurely extend the message history.
    const messages: Message[] = [...this._messages];
    messages.push({ role: "user", content });

    const stream = await openai.chat.completions.create({
      model: this._model,
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      stream: true,
    });

    // process the stream.
    let deltas = [];
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      deltas.push(delta);
      writeChunk?.(delta?.content || "");
    }

    // assume same role across all deltas.
    const role = deltas.find((d) => !!d.role)?.role ?? "assistant";

    // make sure to extend context window with full conversation and save it.
    messages.push({ role, content: deltas.map((d) => d.content).join() });
    this._messages = messages;
  }
  getLatestMessage(): Message {
    return this._messages[this._messages.length - 1];
  }
}
