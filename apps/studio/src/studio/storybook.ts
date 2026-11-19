function storybookOrigin(): string {
  const fromEnv = import.meta.env.VITE_STORYBOOK_URL as string | undefined;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:6106`;
  }
  return "http://localhost:6106";
}

export function storybookComponentUrl(familySlug: string, componentStorySlug: string): string {
  return `${storybookOrigin()}/?path=/story/${familySlug}-${componentStorySlug}--default`;
}

export function storybookHomeUrl(): string {
  return `${storybookOrigin()}/`;
}

export function storybookFrameUrl(storyId: string, globals: string): string {
  const params = new URLSearchParams({ id: storyId, viewMode: "story", globals });
  return `${storybookOrigin()}/iframe.html?${params}`;
}
