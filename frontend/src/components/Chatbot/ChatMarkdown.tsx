'use client';

import { Fragment, type ReactNode } from 'react';

type ChatMarkdownProps = {
  content: string;
  variant?: 'assistant' | 'user';
};

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(
        <strong key={key++} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('*')) {
      nodes.push(
        <em key={key++} className="italic">
          {token.slice(1, -1)}
        </em>,
      );
    } else {
      nodes.push(
        <code key={key++} className="rounded bg-black/10 px-1 py-0.5 font-mono text-[0.8em]">
          {token.slice(1, -1)}
        </code>,
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function isOrderedItem(line: string) {
  return /^\d+\.\s+/.test(line);
}

function isBulletItem(line: string) {
  return /^[-*•]\s+/.test(line);
}

function isHeading(line: string) {
  return /^#{1,3}\s+/.test(line);
}

function isContinuation(line: string) {
  return /^\s{2,}\S/.test(line);
}

export function ChatMarkdown({ content, variant = 'assistant' }: ChatMarkdownProps) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;
  let key = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (isHeading(line)) {
      const level = (line.match(/^#+/)?.[0].length ?? 2) as 1 | 2 | 3;
      const headingClass =
        level === 1 ? 'mb-2 text-base font-semibold' : level === 2 ? 'mb-1.5 text-sm font-semibold' : 'mb-1 text-sm font-semibold';
      blocks.push(
        <p key={key++} className={headingClass}>
          {renderInline(line.replace(/^#{1,3}\s+/, ''))}
        </p>,
      );
      index += 1;
      continue;
    }

    if (isOrderedItem(line)) {
      const items: string[] = [];
      while (index < lines.length) {
        const current = lines[index];
        if (isOrderedItem(current)) {
          items.push(current.replace(/^\d+\.\s+/, ''));
          index += 1;
        } else if (isContinuation(current) && items.length) {
          items[items.length - 1] += ` ${current.trim()}`;
          index += 1;
        } else {
          break;
        }
      }

      blocks.push(
        <ol key={key++} className="my-2 list-decimal space-y-1.5 pl-5 marker:font-semibold">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="pl-1">
              {renderInline(item)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    if (isBulletItem(line)) {
      const items: string[] = [];
      while (index < lines.length) {
        const current = lines[index];
        if (isBulletItem(current)) {
          items.push(current.replace(/^[-*•]\s+/, ''));
          index += 1;
        } else if (isContinuation(current) && items.length) {
          items[items.length - 1] += ` ${current.trim()}`;
          index += 1;
        } else {
          break;
        }
      }

      blocks.push(
        <ul key={key++} className="my-2 list-disc space-y-1.5 pl-5">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="pl-1">
              {renderInline(item)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !isOrderedItem(lines[index]) &&
      !isBulletItem(lines[index]) &&
      !isHeading(lines[index])
    ) {
      paragraphLines.push(lines[index]);
      index += 1;
    }

    blocks.push(
      <p key={key++} className="mb-2 last:mb-0 leading-relaxed">
        {paragraphLines.map((paragraphLine, lineIndex) => (
          <Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {renderInline(paragraphLine)}
          </Fragment>
        ))}
      </p>,
    );
  }

  return (
    <div
      className={`whitespace-normal break-words ${
        variant === 'user' ? '[&_code]:bg-white/20 [&_strong]:text-white' : ''
      }`}
    >
      {blocks}
    </div>
  );
}
