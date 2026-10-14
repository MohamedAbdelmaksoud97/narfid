"use client";

// Adapted from Tiptap's free MIT Simple Editor template installed by its CLI.
import { memo, useCallback, useEffect, useRef, useState, useId } from "react";
import {
  EditorContent,
  EditorContext,
  useEditor,
  useEditorState,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Placeholder } from "@tiptap/extension-placeholder";
import { CharacterCount } from "@tiptap/extension-character-count";
import { FindAndReplace } from "@tiptap/extension-find-and-replace";
import { Selection } from "@tiptap/extensions";
import { NodeSelection } from "@tiptap/pm/state";
import {
  ImagePlus,
  Table2,
  Video,
  Minus,
  Type,
  ArrowLeftToLine,
  ArrowRightToLine,
  ImageIcon,
} from "lucide-react";
import { articleExtensions } from "@/lib/articles/extensions";
import { uploadArticleImageResult } from "@/lib/articles/browser";
import { youtubeId } from "@/lib/articles/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import { ColorHighlightPopover } from "@/components/tiptap-ui/color-highlight-popover";
import { LinkPopover } from "@/components/tiptap-ui/link-popover";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import {
  SearchAndReplace,
  SearchAndReplaceButton,
} from "@/components/tiptap-ui/search-and-replace";
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "./simple-editor.scss";

function Counts({ editor }: { editor: Editor }) {
  const counts = useEditorState({
    editor,
    selector: ({ editor }) => ({
      words: editor.storage.characterCount.words(),
      characters: editor.storage.characterCount.characters(),
    }),
  });
  return (
    <footer className="editor-counts">
      <span>
        {counts.words.toLocaleString("ar-SA")} كلمة ·{" "}
        {counts.characters.toLocaleString("ar-SA")} حرف
      </span>
      <span>Ctrl / ⌘ + S للحفظ · Ctrl / ⌘ + F للبحث</span>
    </footer>
  );
}
function ExtendedTools({
  editor,
  articleId,
  disabled,
}: {
  editor: Editor;
  articleId: string;
  disabled: boolean;
}) {
  const controlId = useId();
  const fieldId = (name: string) => `${controlId}-${name}`;
  const selected = useEditorState({
    editor,
    selector: ({ editor }) => ({
      image: editor.isActive("image"),
      imageAlign: editor.getAttributes("image").textAlign ?? "center",
      imageLayout: editor.getAttributes("image").layout ?? "block",
      table: editor.isActive("table"),
    }),
  });
  const [dialog, setDialog] = useState<"image" | "youtube" | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [editingImage, setEditingImage] = useState(false);
  const imagePosition = useRef<number | null>(null);
  const selection = useRef({ from: 1, to: 1 });
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  function writeBesideImage(textSide: "left" | "right") {
    const position = editor.state.selection.from;
    const image = editor.state.doc.nodeAt(position);
    if (image?.type.name !== "image") return;
    const nextPosition = position + image.nodeSize;
    const next = editor.state.doc.nodeAt(nextPosition);
    const chain = editor
      .chain()
      .focus()
      .updateAttributes("image", {
        layout: "wrap",
        textAlign: textSide === "left" ? "right" : "left",
      });
    // Headings/code blocks clear floats; create a paragraph without altering them.
    if (next?.type.name !== "paragraph")
      chain.insertContentAt(nextPosition, { type: "paragraph" });
    chain.setTextSelection(nextPosition + 1).run();
  }
  function open(kind: "image" | "youtube", editing = false) {
    setEditingImage(editing);
    selection.current = {
      from: editor.state.selection.from,
      to: editor.state.selection.to,
    };
    imagePosition.current = editing ? editor.state.selection.from : null;
    const attrs = editing ? editor.getAttributes("image") : {};
    setAlt(attrs.alt ?? "");
    setCaption(attrs.caption ?? "");
    setFile(null);
    setUrl("");
    setError("");
    setDialog(kind);
  }
  async function insert() {
    setPending(true);
    setError("");
    try {
      if (dialog === "youtube") {
        const id = youtubeId(url);
        if (!id) throw new Error("أدخل رابط YouTube صالحًا باستخدام https.");
        editor
          .chain()
          .focus()
          .setTextSelection(selection.current)
          .setYoutubeVideo({ src: `https://www.youtube.com/watch?v=${id}` })
          .run();
      } else {
        if (!alt.trim())
          throw new Error("أضف وصفًا بديلًا يوضّح محتوى الصورة.");
        let src: string | undefined;
        let dimensions: { width: number; height: number } | undefined;
        if (file) {
          controller.current = new AbortController();
          const image = await uploadArticleImageResult(
            articleId,
            file,
            controller.current.signal,
          );
          src = image.url;
          dimensions = { width: image.width, height: image.height };
        }
        if (imagePosition.current !== null) {
          editor
            .chain()
            .focus()
            .setNodeSelection(imagePosition.current)
            .updateAttributes("image", {
              ...(src ? { src, ...dimensions } : {}),
              alt: alt.trim(),
              caption: caption.trim(),
            })
            .run();
        } else {
          if (!src) throw new Error("اختر صورة أولًا.");
          editor
            .chain()
            .focus()
            .setTextSelection(selection.current)
            .insertContent({
              type: "image",
              attrs: { src, ...dimensions, alt: alt.trim(), caption: caption.trim() },
            })
            .command(({ tr }) => {
              // Inserting before an existing block can leave a text selection;
              // select the new image so its writing controls appear immediately.
              tr.doc.descendants((node, position) => {
                if (node.type.name === "image" && node.attrs.src === src) {
                  tr.setSelection(NodeSelection.create(tr.doc, position));
                  return false;
                }
              });
              return true;
            })
            .run();
        }
      }
      setDialog(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "تعذر إدراج المحتوى.");
    } finally {
      setPending(false);
      controller.current = null;
    }
  }
  return (
    <>
      <ToolbarGroup>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="إدراج صورة"
          aria-label="إدراج صورة"
          disabled={disabled}
          onClick={() => open("image")}
        >
          <ImagePlus data-icon="inline-start" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="فيديو YouTube"
          aria-label="فيديو YouTube"
          disabled={disabled}
          onClick={() => open("youtube")}
        >
          <Video data-icon="inline-start" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="إدراج جدول"
          aria-label="إدراج جدول"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <Table2 data-icon="inline-start" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="فاصل أفقي"
          aria-label="فاصل أفقي"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus data-icon="inline-start" />
        </Button>
        <label className="editor-color-picker" title="لون النص">
          <Type aria-hidden="true" />
          <span className="sr-only">لون النص</span>
          <input
            type="color"
            aria-label="لون النص"
            defaultValue="#3ecf8e"
            disabled={disabled}
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
          />
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().unsetColor().run()}
        >
          إزالة اللون
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="اتجاه الفقرة: عربي"
          aria-label="اتجاه الفقرة: عربي"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextDirection("rtl").run()}
        >
          <ArrowRightToLine data-icon="inline-start" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Paragraph direction: English"
          aria-label="Paragraph direction: English"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextDirection("ltr").run()}
        >
          <ArrowLeftToLine data-icon="inline-start" />
        </Button>
      </ToolbarGroup>
      {selected.table && (
        <div
          className="editor-context-tools"
          role="group"
          aria-label="إدارة الجدول"
        >
          <Button
            size="sm"
            variant="outline"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().addRowBefore().run()}
          >
            صف قبله
          </Button>
          <Button
            size="sm"
            variant="outline"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            صف بعده
          </Button>
          <Button
            size="sm"
            variant="outline"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().addColumnBefore().run()}
          >
            عمود قبله
          </Button>
          <Button
            size="sm"
            variant="outline"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            عمود بعده
          </Button>
          <Button
            size="sm"
            variant="outline"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            حذف الصف
          </Button>
          <Button
            size="sm"
            variant="outline"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            حذف العمود
          </Button>
          <Button
            size="sm"
            variant="outline"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().mergeOrSplit().run()}
          >
            دمج / تقسيم
          </Button>
          <Button
            size="sm"
            variant="outline"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          >
            صف العناوين
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            حذف الجدول
          </Button>
        </div>
      )}
      {selected.image && (
        <div
          className="editor-context-tools"
          role="group"
          aria-label="خصائص الصورة"
        >
          <Button
            size="sm"
            variant="outline"
            onClick={() => open("image", true)}
          >
            <ImageIcon data-icon="inline-start" />
            الوصف والتعليق
          </Button>
          <ToggleGroup
            variant="outline"
            size="sm"
            aria-label="محاذاة الصورة"
            value={[selected.imageAlign]}
            disabled={disabled}
            onValueChange={(values) => {
              if (values[0])
                editor
                  .chain()
                  .focus()
                  .updateAttributes("image", {
                    textAlign: values[0],
                    ...(values[0] === "center" ? { layout: "block" } : {}),
                  })
                  .run();
            }}
          >
            <ToggleGroupItem value="right">يمين</ToggleGroupItem>
            <ToggleGroupItem value="center">وسط</ToggleGroupItem>
            <ToggleGroupItem value="left">يسار</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            variant="outline"
            size="sm"
            aria-label="موضع الصورة مع النص"
            value={[selected.imageLayout]}
            disabled={disabled}
            onValueChange={(values) => {
              if (values[0])
                editor
                  .chain()
                  .focus()
                  .updateAttributes("image", {
                    layout: values[0],
                    ...(values[0] === "wrap" && selected.imageAlign === "center"
                      ? { textAlign: "right" }
                      : {}),
                  })
                  .run();
            }}
          >
            <ToggleGroupItem value="block">سطر مستقل</ToggleGroupItem>
            <ToggleGroupItem value="wrap">النص بجانب الصورة</ToggleGroupItem>
          </ToggleGroup>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => writeBesideImage("left")}
          >
            اكتب يسار الصورة
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => writeBesideImage("right")}
          >
            اكتب يمين الصورة
          </Button>
          <span>اختر جهة النص لبدء الكتابة، واسحب أطراف الصورة لتغيير حجمها.</span>
        </div>
      )}
      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open && !pending) setDialog(null);
        }}
      >
        <DialogContent
          className="editor-media-dialog"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>
              {dialog === "youtube"
                ? "إضافة فيديو YouTube"
                : editingImage
                  ? "خصائص الصورة"
                  : "إضافة صورة"}
            </DialogTitle>
            <DialogDescription>
              {dialog === "youtube"
                ? "يظهر الفيديو داخل المقال بدون تشغيل تلقائي."
                : "صورك تُحفظ في مساحة المقال. أضف وصفًا مناسبًا للقراء ومحركات البحث."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            {dialog === "youtube" ? (
              <Field>
                <FieldLabel htmlFor={fieldId("video-url")}>
                  رابط الفيديو
                </FieldLabel>
                <Input
                  id={fieldId("video-url")}
                  type="url"
                  dir="ltr"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=…"
                  disabled={pending}
                />
              </Field>
            ) : (
              <>
                <Field>
                  <FieldLabel htmlFor={fieldId("body-image")}>
                    الصورة
                  </FieldLabel>
                  <Input
                    id={fieldId("body-image")}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    disabled={pending}
                  />
                  <FieldDescription>
                    PNG، JPG، WebP أو GIF · بحد أقصى 5 ميجابايت.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor={fieldId("image-alt")}>
                    الوصف البديل
                  </FieldLabel>
                  <Input
                    id={fieldId("image-alt")}
                    maxLength={300}
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    disabled={pending}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={fieldId("image-caption")}>
                    تعليق أسفل الصورة (اختياري)
                  </FieldLabel>
                  <Input
                    id={fieldId("image-caption")}
                    maxLength={500}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    disabled={pending}
                  />
                </Field>
              </>
            )}
          </FieldGroup>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button disabled={pending} onClick={() => void insert()}>
            {pending ? "جارٍ الرفع…" : "حفظ وإدراج"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const SimpleEditor = memo(function SimpleEditor({
  content,
  articleId,
  direction,
  onChange,
  disabled = false,
}: {
  content: JSONContent;
  articleId: string;
  direction: "rtl" | "ltr";
  onChange: (content: JSONContent) => void;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState(false);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    textDirection: "auto",
    extensions: [
      ...articleExtensions(),
      Placeholder.configure({
        placeholder: ({ editor }) =>
          editor.isEmpty ? "ابدأ كتابة مقالك هنا…" : "اكتب هنا…",
      }),
      CharacterCount,
      Selection,
      FindAndReplace.configure({ searchDebounceMs: 250, injectCSS: false }),
    ],
    content,
    onUpdate: ({ editor }) => onChangeRef.current(editor.getJSON()),
    editorProps: {
      attributes: {
        class: "simple-editor article-prose",
        "aria-label": "محتوى المقال",
        role: "textbox",
        "aria-multiline": "true",
        spellcheck: "true",
        dir: direction,
      },
      // Strip clipboard's external images and unsafe embed/style baggage; pasted text
      // still goes through the actual schema parser and server validation.
      transformPastedHTML: (html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        doc
          .querySelectorAll("img,iframe,script,style,object,embed")
          .forEach((node) => node.remove());
        doc.querySelectorAll("*").forEach((el) =>
          Array.from(el.attributes).forEach((attr) => {
            if (
              attr.name.startsWith("on") ||
              attr.name === "style" ||
              attr.name === "class"
            )
              el.removeAttribute(attr.name);
          }),
        );
        return doc.body.innerHTML;
      },
    },
  });
  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);
  const change = useCallback(() => setSearch(true), []);
  return (
    <section
      className="simple-editor-wrapper"
      dir={direction}
      aria-label="المحرر"
    >
      <EditorContext.Provider value={{ editor }}>
        <Toolbar aria-label="تنسيق المقال" className="article-toolbar">
          <ToolbarGroup>
            <UndoRedoButton action="undo" aria-label="تراجع" />
            <UndoRedoButton action="redo" aria-label="إعادة" />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4, 5, 6]} />
            <ListDropdownMenu
              modal={false}
              types={["bulletList", "orderedList", "taskList"]}
            />
            <BlockquoteButton />
            <CodeBlockButton />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <MarkButton type="bold" />
            <MarkButton type="italic" />
            <MarkButton type="underline" />
            <MarkButton type="strike" />
            <MarkButton type="code" />
            <ColorHighlightPopover useColorValue />
            <LinkPopover autoOpenOnLinkActive={false} />
            <MarkButton type="superscript" />
            <MarkButton type="subscript" />
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <TextAlignButton align="right" />
            <TextAlignButton align="center" />
            <TextAlignButton align="left" />
            <TextAlignButton align="justify" />
          </ToolbarGroup>
          {editor && (
            <ExtendedTools
              editor={editor}
              articleId={articleId}
              disabled={disabled}
            />
          )}
          <ToolbarGroup>
            <SearchAndReplaceButton
              aria-label="بحث واستبدال"
              onClick={() => setSearch(!search)}
              aria-expanded={search}
            />
          </ToolbarGroup>
        </Toolbar>
        <SearchAndReplace
          className="simple-editor-search-and-replace"
          open={search}
          onOpen={change}
          onClose={() => setSearch(false)}
        />
        {editor && (
          <BubbleMenu
            editor={editor}
            shouldShow={({ editor, state }) =>
              !state.selection.empty &&
              editor.isEditable &&
              !editor.isActive("image") &&
              !editor.isActive("table")
            }
          >
            <Toolbar variant="floating" aria-label="تنسيق النص المحدد">
              <MarkButton type="bold" />
              <MarkButton type="italic" />
              <MarkButton type="underline" />
              <LinkPopover autoOpenOnLinkActive={false} />
            </Toolbar>
          </BubbleMenu>
        )}
        <EditorContent editor={editor} className="simple-editor-content" />
        {editor ? (
          <Counts editor={editor} />
        ) : (
          <p className="editor-counts" role="status">
            جارٍ تجهيز المحرر…
          </p>
        )}
      </EditorContext.Provider>
    </section>
  );
});
