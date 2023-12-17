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

  async streamNewResponse(content: string, writeChunk?: (s: string) => void) {
    // @ts-ignore
    const stream = await openai.chat.completions.create({
      model: this._model,
      messages: [...this._messages, { role: "user", content }],
      stream: true,
    });

    // process the stream. TODO: handle errors
    let deltas = [];
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      deltas.push(delta);
      writeChunk?.(delta?.content || "");
    }

    // make sure to extend context window with full conversation.
    this.saveBackAndForth(content, deltas.map((d) => d.content).join());
  }

  private saveBackAndForth(userContent: string, asstContent: string) {
    this._messages.push({ role: "user", content: userContent });
    this._messages.push({ role: "assistant", content: asstContent });
  }
}
