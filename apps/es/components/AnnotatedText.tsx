import type { ReactNode } from "react";
import type {
  RoughAnnotationType,
  RoughPadding,
} from "rough-notation/lib/model";
import RoughAnnotation from "@/components/RoughAnnotation";

const TAG_REGEX = /\[([\w-]+)\]([\s\S]+?)\[\/\1\]/g;

const TYPE_DEFAULTS: Partial<
  Record<RoughAnnotationType, { padding?: RoughPadding; strokeWidth?: number }>
> = {
  circle: { padding: [8, 12], strokeWidth: 2.5 },
  underline: { padding: 2, strokeWidth: 2 },
  box: { padding: 6, strokeWidth: 2 },
  highlight: { padding: 2 },
  bracket: { padding: 4 },
};

const SUPPORTED: ReadonlySet<string> = new Set([
  "underline",
  "box",
  "circle",
  "highlight",
  "strike-through",
  "crossed-off",
  "bracket",
]);

type Props = {
  text: string;
};

export default function AnnotatedText({ text }: Props) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  const regex = new RegExp(TAG_REGEX.source, "g");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const [full, tag, inner] = match;
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (SUPPORTED.has(tag)) {
      const type = tag as RoughAnnotationType;
      parts.push(
        <RoughAnnotation key={key++} type={type} {...(TYPE_DEFAULTS[type] ?? {})}>
          {inner}
        </RoughAnnotation>,
      );
    } else {
      parts.push(inner);
    }
    lastIndex = match.index + full.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
