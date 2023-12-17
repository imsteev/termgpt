import OpenAI from "openai";

// gets API Key from environment variable OPENAI_API_KEY
const openai = new OpenAI();

type message = { content: string; role: "user" | "assistant" | "system" };

export class Conversation {
  _model!: string;
  _messages!: message[];

  constructor(model: string, stream = false) {
    this._model = model;
    this._messages = [];
  }

  // TODO: handle errors
  async sendMessage(content: string) {
    const newMessages = this.prepareMessages({ role: "user", content });
    const completion = await openai.chat.completions.create({
      model: this._model,
      messages: newMessages,
    });
    const responseMsg = completion.choices[0].message;
    this._messages = this.prepareMessages({
      role: responseMsg.role,
      content: responseMsg.content ?? "",
    });
    return this.getLatestMessage();
  }

  getLatestMessage(): message {
    return this._messages[this._messages.length - 1];
  }

  private prepareMessages(msg: message): message[] {
    return [...this._messages, msg];
  }
}
