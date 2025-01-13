import he from "he";

export const decodeHtmlEntities = (text: string): string => {
  return he.decode(text);
};
export const encodeHtmlEntities = (text: string): string => { 
    return he.encode(text);
};