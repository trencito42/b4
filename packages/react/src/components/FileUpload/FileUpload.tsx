import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { Field } from "../Field/Field.js";
import { IconButton } from "../IconButton/IconButton.js";

export interface FileUploadProps {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  /** Native `accept` attribute syntax, e.g. `"image/*,.pdf"`. */
  accept?: string;
  maxSizeBytes?: number;
  maxFiles?: number;
  multiple?: boolean;
  value?: readonly File[];
  defaultValue?: readonly File[];
  onValueChange?: (files: File[]) => void;
  className?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Best-effort match against the native `accept` syntax (MIME type, `type/*`, or `.ext`). Browsers already filter the native picker by this; this is for files arriving via drop, which bypasses that filter. */
function matchesAccept(file: File, accept: string) {
  const patterns = accept.toLowerCase().split(",").map((p) => p.trim()).filter(Boolean);
  if (patterns.length === 0) return true;
  return patterns.some((pattern) => {
    if (pattern.startsWith(".")) return file.name.toLowerCase().endsWith(pattern);
    if (pattern.endsWith("/*")) return file.type.toLowerCase().startsWith(pattern.slice(0, -1));
    return file.type.toLowerCase() === pattern;
  });
}

const RemoveIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
  </svg>
);

/**
 * A real file dropzone — the actual native `<input type="file">` is
 * positioned over the whole visible dropzone (not a decorative replica
 * triggered by a `click()` proxy), so click-to-browse and keyboard
 * operability (Tab + Enter opens the native picker) come from genuine
 * browser file-input behavior. Drag-and-drop reads `event.dataTransfer
 * .files` directly in a real `onDrop` handler — a browser will not set
 * a file input's own `.files` from a script-dispatched drop event (only
 * a real, trusted OS-level drag does that reliably), so relying on
 * "drop lands on the input and the browser populates it" was an
 * untested assumption that a Playwright drop-event test caught before
 * this shipped. Client-side validation (`accept`, `maxSizeBytes`,
 * `maxFiles`) runs on the real `FileList` either path produces, since a
 * dropped file bypasses the native picker's own `accept` filtering.
 */
export function FileUpload({
  label,
  hideLabel,
  hint,
  error,
  disabled = false,
  required = false,
  accept,
  maxSizeBytes,
  maxFiles,
  multiple = true,
  value,
  defaultValue,
  onValueChange,
  className,
}: FileUploadProps) {
  const [uncontrolledFiles, setUncontrolledFiles] = useState<File[]>(() => [...(defaultValue ?? [])]);
  const files = value ?? uncontrolledFiles;
  const [rejections, setRejections] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function applyFiles(incoming: FileList | null) {
    if (!incoming || incoming.length === 0) return;
    const accepted: File[] = [];
    const rejected: string[] = [];

    for (const file of Array.from(incoming)) {
      if (accept && !matchesAccept(file, accept)) {
        rejected.push(`${file.name}: not an accepted file type`);
        continue;
      }
      if (maxSizeBytes !== undefined && file.size > maxSizeBytes) {
        rejected.push(`${file.name}: exceeds ${formatBytes(maxSizeBytes)}`);
        continue;
      }
      accepted.push(file);
    }

    let next = multiple ? [...files, ...accepted] : accepted.slice(0, 1);
    if (maxFiles !== undefined && Number.isFinite(maxFiles)) {
      const limit = Math.max(0, Math.floor(maxFiles));
      // A limit change applies to incoming files and never removes files
      // already supplied by the caller.
      const capacity = multiple ? Math.max(0, limit - files.length) : limit;
      const overflow = Math.max(0, (multiple ? accepted.length : next.length) - capacity);
      if (overflow) {
        rejected.push(`${overflow} file${overflow === 1 ? "" : "s"} skipped: limit is ${limit}`);
        next = next.slice(0, multiple ? files.length + capacity : capacity);
      }
    }

    setRejections(rejected);
    if (multiple ? next.length > files.length : next.length > 0) {
      if (value === undefined) setUncontrolledFiles(next);
    } else {
      next = [...files];
    }
    onValueChange?.(next);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeFile(index: number) {
    const next = files.filter((_, i) => i !== index);
    if (value === undefined) setUncontrolledFiles(next);
    onValueChange?.(next);
  }

  return (
    <Field label={label} hideLabel={hideLabel} hint={hint} error={error} disabled={disabled} required={required} className={className}>
      <div
        className={["b4-file-upload__dropzone", dragActive ? "b4-file-upload__dropzone--active" : ""]
          .filter(Boolean)
          .join(" ")}
        onDragEnter={(event: DragEvent) => {
          event.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragOver={(event: DragEvent) => event.preventDefault()}
        onDragLeave={(event: DragEvent) => {
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
          setDragActive(false);
        }}
        onDrop={(event: DragEvent) => {
          event.preventDefault();
          setDragActive(false);
          if (disabled) return;
          applyFiles(event.dataTransfer.files);
        }}
      >
        <BaseField.Control
          render={
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              className="b4-file-upload__input"
              onChange={(event: ChangeEvent<HTMLInputElement>) => applyFiles(event.target.files)}
            />
          }
          disabled={disabled}
          required={required && files.length === 0}
        />
        <p className="b4-file-upload__instructions">
          <strong>Drag files here</strong> or click to browse
        </p>
      </div>

      {rejections.length > 0 && (
        <ul className="b4-file-upload__rejections" role="alert">
          {rejections.map((message, index) => (
            <li key={`${index}-${message}`}>{message}</li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="b4-file-upload__list">
          {files.map((file, index) => (
            <li className="b4-file-upload__item" key={`${file.name}-${file.lastModified}-${index}`}>
              <span className="b4-file-upload__item-name">{file.name}</span>
              <span className="b4-file-upload__item-size">{formatBytes(file.size)}</span>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={`Remove ${file.name}`}
                icon={RemoveIcon}
                disabled={disabled}
                onClick={() => removeFile(index)}
              />
            </li>
          ))}
        </ul>
      )}
    </Field>
  );
}
