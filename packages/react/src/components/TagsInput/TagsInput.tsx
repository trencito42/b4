import {
  forwardRef,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Input } from "@base-ui/react/input";
import { Field } from "../Field/Field.js";
import { FieldControl } from "../../internal/FieldControl.js";
import { useControllableState } from "../../hooks/useControllableState.js";

export type TagsInputSize = "sm" | "md" | "lg";

export interface TagsInputProps {
  label: ReactNode;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  size?: TagsInputSize;
  placeholder?: string;
  /** Controlled tag list. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /**
   * Also commit the draft when the user types a comma, and split pasted
   * text on commas. Turn this off for tags that legitimately contain
   * commas — pasted text then only splits on newlines and tabs.
   * @default true
   */
  addOnComma?: boolean;
  /**
   * Lowercase every tag as it is added. Duplicate detection compares the
   * *stored* value, so this is also how you make duplicates
   * case-insensitive: with it off, "React" and "react" are two tags.
   * @default false
   */
  lowercase?: boolean;
  /** @default false */
  allowDuplicates?: boolean;
  /** Maximum number of tags. Further additions are ignored. */
  maxTags?: number;
  /** Maximum length of a single tag. Longer entries are rejected, not truncated. */
  maxLength?: number;
  /** Return false to reject a tag. Runs after trimming/lowercasing, before the duplicate check. */
  validate?: (tag: string) => boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** Submits one hidden input per tag under this name, so the field works in a plain `<form>`. */
  name?: string;
  className?: string;
}

const REMOVE_GLYPH = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="m4.5 4.5 7 7m0-7-7 7" strokeLinecap="round" />
  </svg>
);

/**
 * Free-form tag entry — a list of committed tags plus a draft input,
 * sharing the Family B `Field` wrapper and `FieldControl` focus surface
 * so it sits at the same height, radius and focus treatment as
 * `TextField` rather than looking like a second input family.
 *
 * Commits a tag on Enter (and on comma when `addOnComma`), splits pasted
 * text into several tags, and removes the last tag on Backspace from an
 * empty draft. Tag chips are a real roving-focus list: ArrowLeft from the
 * empty draft steps back into them, arrows move between them, and
 * Backspace/Delete removes the focused one.
 *
 * **IME safety:** Enter is ignored while a composition is active
 * (`isComposing` on the native event, plus a composition-tracking ref for
 * engines that fire `keydown` after `compositionend` without the flag) —
 * otherwise committing a Japanese/Chinese/Korean candidate selection
 * would silently turn a half-typed word into a tag.
 */
export const TagsInput = forwardRef<HTMLInputElement, TagsInputProps>(function TagsInput(
  {
    label,
    hideLabel,
    hint,
    error,
    size = "md",
    placeholder,
    value,
    defaultValue,
    onValueChange,
    addOnComma = true,
    lowercase = false,
    allowDuplicates = false,
    maxTags,
    maxLength,
    validate,
    disabled = false,
    readOnly = false,
    required = false,
    name,
    className,
  },
  ref,
) {
  const [tags, setTags] = useControllableState<string[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange: onValueChange,
  });
  const [draft, setDraft] = useControllableState<string>({ defaultValue: "" });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const composingRef = useRef(false);

  const interactive = !disabled && !readOnly;
  const hasError = Boolean(error);

  function normalize(raw: string): string {
    const trimmed = raw.trim();
    return lowercase ? trimmed.toLowerCase() : trimmed;
  }

  function accepts(tag: string, against: string[]): boolean {
    if (!tag) return false;
    if (maxLength !== undefined && tag.length > maxLength) return false;
    if (maxTags !== undefined && against.length >= maxTags) return false;
    if (!allowDuplicates && against.includes(tag)) return false;
    if (validate && !validate(tag)) return false;
    return true;
  }

  /** Adds every acceptable entry in one state update, so pasting N tags is one change, not N. */
  function commit(raws: string[]) {
    if (!interactive) return;
    setTags((prev) => {
      const next = [...prev];
      for (const raw of raws) {
        const tag = normalize(raw);
        if (accepts(tag, next)) next.push(tag);
      }
      return next;
    });
  }

  function removeAt(index: number) {
    if (!interactive) return;
    setTags((prev) => prev.filter((_, i) => i !== index));
  }

  function focusTagButton(index: number) {
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("[data-b4-tag-remove]");
    buttons?.[index]?.focus();
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!interactive) return;

    if (event.key === "Enter") {
      // Never commit mid-composition: the Enter that accepts an IME
      // candidate must not also create a tag.
      if (composingRef.current || event.nativeEvent.isComposing) return;
      event.preventDefault();
      if (draft.trim()) {
        commit([draft]);
        setDraft("");
      }
      return;
    }

    if (event.key === "," && addOnComma) {
      if (composingRef.current || event.nativeEvent.isComposing) return;
      event.preventDefault();
      if (draft.trim()) {
        commit([draft]);
        setDraft("");
      }
      return;
    }

    if (event.key === "Backspace" && draft === "" && tags.length > 0) {
      event.preventDefault();
      removeAt(tags.length - 1);
      return;
    }

    if (event.key === "ArrowLeft" && draft === "" && tags.length > 0) {
      event.preventDefault();
      focusTagButton(tags.length - 1);
    }
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusTagButton(index - 1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      if (index < tags.length - 1) focusTagButton(index + 1);
      else inputRef.current?.focus();
      return;
    }
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      removeAt(index);
      // The list shrinks under us: step onto the tag that slides into
      // this slot, or back to the draft when that was the last one.
      if (tags.length - 1 > index) requestAnimationFrame(() => focusTagButton(index));
      else if (index > 0) requestAnimationFrame(() => focusTagButton(index - 1));
      else inputRef.current?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    if (!interactive) return;
    const text = event.clipboardData.getData("text");
    const pattern = addOnComma ? /[,\n\r\t]+/ : /[\n\r\t]+/;
    const parts = text.split(pattern).filter((part) => part.trim());
    // A single-token paste is ordinary typing — let the browser insert it
    // into the draft rather than committing a tag the user can't edit.
    if (parts.length < 2) return;
    event.preventDefault();
    commit(parts);
    setDraft("");
  }

  return (
    <Field
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      error={error}
      required={required}
      disabled={disabled}
      className={["b4-tags-input", className ?? ""].filter(Boolean).join(" ")}
    >
      <FieldControl
        disabled={disabled}
        data-readonly={readOnly || undefined}
        className={[
          "b4-text-field__control",
          "b4-tags-input__control",
          `b4-tags-input__control--${size}`,
          hasError ? "b4-text-field__control--error" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onMouseDown={(event) => {
          // Clicking the padding focuses the draft, like a native input's
          // whole box does — but never steal a click aimed at a chip.
          if (event.target === event.currentTarget) {
            event.preventDefault();
            inputRef.current?.focus();
          }
        }}
      >
        {tags.length > 0 && (
          <ul ref={listRef} className="b4-tags-input__list">
            {tags.map((tag, index) => (
              <li key={`${tag}-${index}`} className="b4-tags-input__tag">
                <span className="b4-tags-input__tag-label">{tag}</span>
                {interactive && (
                  <button
                    type="button"
                    data-b4-tag-remove=""
                    className="b4-tags-input__tag-remove"
                    aria-label={`Remove ${tag}`}
                    onClick={() => {
                      removeAt(index);
                      inputRef.current?.focus();
                    }}
                    onKeyDown={(event) => handleTagKeyDown(event, index)}
                  >
                    {REMOVE_GLYPH}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        <Input
          ref={(node: HTMLInputElement | null) => {
            inputRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          className="b4-text-field__input b4-tags-input__input"
          value={draft}
          onValueChange={setDraft}
          onKeyDown={handleInputKeyDown}
          onPaste={handlePaste}
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionEnd={() => {
            composingRef.current = false;
          }}
          onBlur={() => {
            // Commit what the user typed rather than silently dropping it
            // when focus leaves — the most common complaint about tag
            // fields that only listen for Enter.
            if (interactive && draft.trim()) {
              commit([draft]);
              setDraft("");
            }
          }}
          disabled={disabled}
          readOnly={readOnly}
          required={required && tags.length === 0}
          maxLength={maxLength}
          placeholder={tags.length === 0 ? placeholder : undefined}
        />
      </FieldControl>
      {name &&
        tags.map((tag, index) => (
          <input key={`${name}-${tag}-${index}`} type="hidden" name={name} value={tag} />
        ))}
    </Field>
  );
});
