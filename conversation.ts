import OpenAI from "openai";

const openai = new OpenAI();

export class Conversation {
  _model!: string;
  _messages!: { content: string | null; role: OpenAI.ChatCompletionRole }[];

  constructor(model: string, systemPrompt = "") {
    this._model = model;
    this._messages = [];
    if (systemPrompt) {
      this._messages.push({ role: "system", content: systemPrompt });
    }
  }

  async streamNewResponse(content: string, writeChunk?: (s: string) => void) {
    const stream = await openai.chat.completions.create({
      model: this._model,
      messages: [
        ...this._messages,
        { role: "user", content },
      ] as OpenAI.ChatCompletionMessageParam[], // ugh, typescript.
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
