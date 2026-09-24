import sharp from "sharp";

type Role = "system" | "human" | "ai";

abstract class BaseMessage {
  role: Role;
  content: string;

  constructor(role: Role, content: string) {
    this.role = role;
    this.content = content;
  }
}

class SystemMessage extends BaseMessage {
  role: "system" = "system";

  constructor(content: string) {
    super("system", content);
  }
}

class HumanMessage extends BaseMessage {
  role: "human" = "human";

  constructor(content: string) {
    super("human", content);
  }
}

class AIMessage extends BaseMessage {
  role: "ai" = "ai";

  constructor(content: string) {
    super("ai", content);
  }
}

class ImageMessage extends BaseMessage {
  role: "human" = "human";
  image: sharp.Sharp | null;
  mimeType: string;

  constructor(
    content: string,
    image: sharp.Sharp,
    mimeType: string = "image/png"
  ) {
    super("human", content);
    this.image = image;
    this.mimeType = mimeType;
  }

  async imageToBase64(): Promise<string | undefined> {
    const imageBytes = await this.imageToBytes();
    if (imageBytes) return Buffer.from(imageBytes).toString("base64");
  }

  async scaleImage(scale: number = 0.5): Promise<void> {
    if (!this.image) return;

    const metadata = await this.image.metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    const size = {
      width: Math.floor(width * scale),
      height: Math.floor(height * scale),
    };

    this.image = this.image.resize(size.width, size.height);
  }

  async imageToBytes(): Promise<Buffer<ArrayBufferLike> | undefined> {
    if (!this.image) return Buffer.alloc(0);
    return await this.image.toBuffer();
  }
}

export { BaseMessage, SystemMessage, HumanMessage, ImageMessage, AIMessage };
export type { Role };
