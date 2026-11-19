const STORYBOOK_ORIGIN =
  (import.meta.env.VITE_STORYBOOK_URL as string | undefined) ?? "http://localhost:6106";

export function storybookComponentUrl(familySlug: string, componentStorySlug: string): string {
  return `${STORYBOOK_ORIGIN}/?path=/story/${familySlug}-${componentStorySlug}--default`;
}

export function storybookHomeUrl(): string {
  return `${STORYBOOK_ORIGIN}/`;
}