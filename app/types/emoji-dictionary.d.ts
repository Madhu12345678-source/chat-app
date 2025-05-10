// filepath: c:\Users\madhu\whatsapp\Frontend\types\emoji-dictionary.d.ts
declare module "emoji-dictionary" {
    const emoji: {
      names: string[];
      getUnicode: (name: string) => string;
    };
    export default emoji;
  }