import { useMemo, useState } from "react";
import {
  AlertDialog,
  Button,
  Checkbox,
  ColorPicker,
  DatePicker,
  FileUpload,
  InlineAlert,
  MultiSelect,
  NumberField,
  PageHeader,
  PasswordField,
  RadioGroup,
  Select,
  Slider,
  Switch,
  Tabs,
  TagsInput,
  TextField,
  Textarea,
  TimePicker,
  toastManager,
  type TimeValue,
} from "@b4/react";
import type { StudioPreviewWidth } from "../settings.js";

interface SettingsState {
  name: string;
  email: string;
  bio: string;
  avatar: File[];
  language: string;
  accentColor: string;
  digestFrequency: string;
  sidebarWidth: number;
  sessionTimeout: number;
  trustedDevices: string[];
  allowedDomains: string[];
  quietHoursStart: TimeValue;
  passwordExpiry: Date | null;
  twoFactor: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
}

const initialState: SettingsState = {
  name: "Stefan Rotaru",
  email: "stefan@example.com",
  bio: "Design systems and frontend infrastructure.",
  avatar: [],
  language: "en",
  accentColor: "#3366cc",
  digestFrequency: "weekly",
  sidebarWidth: 280,
  sessionTimeout: 30,
  trustedDevices: ["work-laptop"],
  allowedDomains: ["example.com", "b4.studio"],
  quietHoursStart: { hours: 22, minutes: 0 },
  passwordExpiry: null,
  twoFactor: true,
  emailNotifications: true,
  pushNotifications: false,
  marketingEmails: false,
};

function previewClass(width: StudioPreviewWidth): string {
  if (width === "390") return "b4-studio__preview-frame--390";
  if (width === "768") return "b4-studio__preview-frame--768";
  if (width === "1440") return "b4-studio__preview-frame--1440";
  return "";
}

/**
 * Studio -> Showcases -> Settings. A real multi-section account/workspace
 * settings page exercising Family B's full input vocabulary, Tabs, a
 * controlled AlertDialog for discarding changes, and a sticky save/discard
 * bar driven by real dirty-state tracking (not a decorative footer). All
 * state is local/sample; nothing is persisted beyond this page's lifetime.
 */
export function ShowcaseSettingsPage({ previewWidth }: { previewWidth: StudioPreviewWidth }) {
  const [saved, setSaved] = useState<SettingsState>(initialState);
  const [draft, setDraft] = useState<SettingsState>(initialState);
  const [tab, setTab] = useState("profile");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [passwordError, setPasswordError] = useState<{ current?: string; next?: string }>({});
  const [saving, setSaving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]) ||
    Boolean(passwords.current || passwords.next);

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!draft.email.includes("@")) {
      setEmailError("Enter a valid email address.");
      setTab("profile");
      throw new Error("validation failed");
    }
    setEmailError(undefined);
    if (passwords.current || passwords.next) {
      const current = passwords.current ? undefined : "Enter the current password.";
      const next = passwords.next.length >= 12 ? undefined : "Enter at least 12 characters.";
      if (current || next) {
        setPasswordError({ current, next });
        setTab("security");
        throw new Error("validation failed");
      }
    }
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSaved(draft);
    setPasswords((latest) => latest === passwords ? { current: "", next: "" } : latest);
    setPasswordError({});
    setSaving(false);
    toastManager.add({ title: "Settings saved", type: "success" });
  }

  function confirmDiscard() {
    setDraft(saved);
    setEmailError(undefined);
    setPasswords({ current: "", next: "" });
    setPasswordError({});
    setDiscardOpen(false);
    toastManager.add({ title: "Changes discarded", type: "info" });
  }

  return (
    <div className={["b4-studio__preview-frame", previewClass(previewWidth)].filter(Boolean).join(" ")}>
      <PageHeader
        title="Settings"
        description="Account and workspace settings — sample data only, built entirely from @b4/react Family B inputs."
      />

      <div className="b4-showcase-settings" style={{ marginTop: "var(--b4-space-8)" }}>
        <Tabs
          aria-label="Settings sections"
          value={tab}
          onValueChange={setTab}
          items={[
            {
              value: "profile",
              label: "Profile",
              content: (
                <div className="b4-showcase-settings__section">
                  <TextField
                    label="Full name"
                    value={draft.name}
                    onValueChange={(name) => update("name", name)}
                  />
                  <TextField
                    label="Email address"
                    value={draft.email}
                    error={emailError}
                    onValueChange={(email) => update("email", email)}
                  />
                  <Textarea
                    label="Bio"
                    hint="Shown on your public profile."
                    value={draft.bio}
                    onChange={(event) => update("bio", event.target.value)}
                  />
                  <FileUpload
                    label="Avatar"
                    accept="image/*"
                    multiple={false}
                    value={draft.avatar}
                    onValueChange={(avatar) => update("avatar", avatar)}
                  />
                </div>
              ),
            },
            {
              value: "preferences",
              label: "Preferences",
              content: (
                <div className="b4-showcase-settings__section">
                  <Select
                    label="Language"
                    items={[
                      { value: "en", label: "English" },
                      { value: "ro", label: "Română" },
                      { value: "fr", label: "Français" },
                      { value: "de", label: "Deutsch" },
                    ]}
                    value={draft.language}
                    onValueChange={(language) => update("language", language ?? draft.language)}
                  />
                  <ColorPicker
                    label="Accent color"
                    value={draft.accentColor}
                    onValueChange={(accentColor) => update("accentColor", accentColor)}
                  />
                  <div className="b4-showcase-settings__field-group">
                    <span className="b4-showcase-settings__field-label">Digest frequency</span>
                    <RadioGroup
                      aria-label="Digest frequency"
                      items={[
                        { value: "daily", label: "Daily" },
                        { value: "weekly", label: "Weekly" },
                        { value: "never", label: "Never" },
                      ]}
                      value={draft.digestFrequency}
                      onValueChange={(digestFrequency) => update("digestFrequency", digestFrequency)}
                    />
                  </div>
                  <Slider
                    label="Sidebar width"
                    min={220}
                    max={360}
                    step={10}
                    value={draft.sidebarWidth}
                    onValueChange={(sidebarWidth) => update("sidebarWidth", sidebarWidth as number)}
                  />
                </div>
              ),
            },
            {
              value: "security",
              label: "Security",
              content: (
                <div className="b4-showcase-settings__section">
                  <PasswordField label="Current password" autoComplete="current-password" value={passwords.current} error={passwordError.current} onValueChange={(current) => {
                    setPasswords((previous) => ({ ...previous, current }));
                    setPasswordError((previous) => ({ ...previous, current: undefined }));
                  }} />
                  <PasswordField label="New password" autoComplete="new-password" hint="At least 12 characters." value={passwords.next} error={passwordError.next} onValueChange={(next) => {
                    setPasswords((previous) => ({ ...previous, next }));
                    setPasswordError((previous) => ({ ...previous, next: undefined }));
                  }} />
                  <Switch
                    label="Require two-factor authentication"
                    checked={draft.twoFactor}
                    onCheckedChange={(twoFactor) => update("twoFactor", twoFactor)}
                  />
                  <MultiSelect
                    label="Trusted devices"
                    items={[
                      { value: "work-laptop", label: "Work laptop" },
                      { value: "home-desktop", label: "Home desktop" },
                      { value: "phone", label: "Phone" },
                      { value: "tablet", label: "Tablet" },
                    ]}
                    value={draft.trustedDevices}
                    onValueChange={(trustedDevices) => update("trustedDevices", trustedDevices)}
                  />
                  <TagsInput
                    label="Allowed sign-in domains"
                    hint="Press Enter or type a comma. Paste a list to add several at once."
                    placeholder="example.com"
                    lowercase
                    maxTags={8}
                    validate={(domain) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)}
                    value={draft.allowedDomains}
                    onValueChange={(allowedDomains) => update("allowedDomains", allowedDomains)}
                  />
                  <NumberField
                    label="Session timeout (minutes)"
                    min={5}
                    max={180}
                    step={5}
                    value={draft.sessionTimeout}
                    onValueChange={(sessionTimeout) => update("sessionTimeout", sessionTimeout ?? draft.sessionTimeout)}
                  />
                  <TimePicker
                    label="Quiet hours start"
                    value={draft.quietHoursStart}
                    onValueChange={(quietHoursStart) => update("quietHoursStart", quietHoursStart)}
                  />
                  <DatePicker
                    label="Password expiry reminder"
                    value={draft.passwordExpiry}
                    onValueChange={(passwordExpiry) => update("passwordExpiry", passwordExpiry)}
                  />
                </div>
              ),
            },
            {
              value: "notifications",
              label: "Notifications",
              content: (
                <div className="b4-showcase-settings__section">
                  <InlineAlert tone="info" title="Delivery">
                    Email notifications are sent to {draft.email || "your account email"}.
                  </InlineAlert>
                  <Checkbox
                    label="Email notifications"
                    checked={draft.emailNotifications}
                    onCheckedChange={(emailNotifications) => update("emailNotifications", emailNotifications)}
                  />
                  <Checkbox
                    label="Push notifications"
                    checked={draft.pushNotifications}
                    onCheckedChange={(pushNotifications) => update("pushNotifications", pushNotifications)}
                  />
                  <Checkbox
                    label="Product and marketing emails"
                    checked={draft.marketingEmails}
                    onCheckedChange={(marketingEmails) => update("marketingEmails", marketingEmails)}
                  />
                </div>
              ),
            },
          ]}
        />

        {isDirty && (
          <div className="b4-showcase-settings__bar" role="group" aria-label="Unsaved changes">
            <span className="b4-showcase-settings__bar-text">You have unsaved changes.</span>
            <div className="b4-showcase-settings__bar-actions">
              <Button variant="ghost" size="sm" disabled={saving} onClick={() => setDiscardOpen(true)}>
                Discard
              </Button>
              <Button variant="primary" size="sm" onAction={handleSave}>
                Save changes
              </Button>
            </div>
          </div>
        )}

        <AlertDialog
          title="Discard unsaved changes?"
          description="Your edits on this page will be lost. This can't be undone."
          confirmLabel="Discard changes"
          open={discardOpen}
          onOpenChange={setDiscardOpen}
          onConfirm={confirmDiscard}
        />
      </div>
    </div>
  );
}
