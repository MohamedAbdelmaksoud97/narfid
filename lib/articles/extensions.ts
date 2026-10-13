import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import { Superscript } from "@tiptap/extension-superscript";
import { Subscript } from "@tiptap/extension-subscript";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import { TableKit } from "@tiptap/extension-table";
import { Youtube } from "@tiptap/extension-youtube";
import { Typography } from "@tiptap/extension-typography";

export const ArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: { default: "", rendered: false },
      layout: {
        default: "block",
        parseHTML: (el) => el.getAttribute("data-layout") ?? "block",
        renderHTML: (attrs) => ({ "data-layout": attrs.layout }),
      },
      textAlign: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") ?? "center",
        renderHTML: (attrs) => ({ "data-align": attrs.textAlign }),
      },
    };
  },
});
// Same document schema for the editor, server validation, and static renderer.
export function articleExtensions() {
  return [
    StarterKit.configure({
      link: {
        openOnClick: false,
        enableClickSelection: true,
        protocols: ["https", "http", "mailto", "tel"],
      },
    }),
    TaskList,
    TaskItem.configure({ nested: true }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Highlight.configure({ multicolor: true }),
    Superscript,
    Subscript,
    TextStyle,
    Color,
    Typography,
    ArticleImage.configure({
      allowBase64: false,
      resize: {
        enabled: true,
        minWidth: 80,
        minHeight: 50,
        alwaysPreserveAspectRatio: true,
      },
    }),
    TableKit.configure({ table: { resizable: true } }),
    Youtube.configure({
      nocookie: true,
      autoplay: false,
      addPasteHandler: false,
    }),
  ];
}
