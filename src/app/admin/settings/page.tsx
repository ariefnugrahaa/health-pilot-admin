"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  getSystemSettings,
  updateSystemSettings,
  type SystemSettings,
} from "@/services/settings-service";

const defaultSystemSettings: SystemSettings = {
  matchingRulesEnabled: true,
  bloodTestAllowUpload: true,
  bloodTestAllowOrder: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(
    defaultSystemSettings,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const data = await getSystemSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, []);

  const saveSystemSettings = async (next: SystemSettings) => {
    const previous = settings;
    setSettings(next);
    setIsSaving(true);

    try {
      await updateSystemSettings(next);
    } catch (error) {
      console.error("Failed to save setting:", error);
      setSettings(previous);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = async (key: keyof SystemSettings, value: boolean) => {
    await saveSystemSettings({ ...settings, [key]: value });
  };

  const handleBloodTestToggle = async (checked: boolean) => {
    await saveSystemSettings({
      ...settings,
      bloodTestAllowUpload: checked,
      bloodTestAllowOrder: checked,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#14b8a6]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-10 border-b border-[#e5e7eb] pb-4">
        <h1 className="text-4xl font-extrabold text-[#202124]">Settings</h1>
        <p className="mt-2 text-[16px] text-[#5f6368]">
          Manage configuration options for the provider network platform
        </p>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-4xl font-extrabold text-[#202124]">
          Experience &amp; Content
        </h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-[#d7dbe0] bg-[#f9fafb] px-10 py-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-4xl font-extrabold text-[#202124]">
                  Landing Page
                </h3>
                <p className="mt-2 text-[16px] text-[#6b7280]">
                  Configure user facing rules and content.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-xl border-[#14b8a6] px-7 text-[16px] text-[#129b99] hover:bg-[#e9fbf8]"
              >
                <Link href="/admin/settings/landing">
                  Edit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-[#d7dbe0] bg-[#f9fafb] px-10 py-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-4xl font-extrabold text-[#202124]">
                  Legal &amp; Policies
                </h3>
                <p className="mt-2 text-[16px] text-[#6b7280]">
                  Manage disclaimers, terms and user agreements
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-xl border-[#14b8a6] px-7 text-[16px] text-[#129b99] hover:bg-[#e9fbf8]"
              >
                <Link href="/admin/settings/legal">
                  Edit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-4xl font-extrabold text-[#202124]">
          System &amp; Logic
        </h2>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#d7dbe0] bg-[#f9fafb] px-10 py-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-4xl font-extrabold text-[#202124]">
                  Matching Rules
                </h3>
                <p className="mt-2 text-[16px] text-[#6b7280]">
                  Enable or disable matching rules for pathway eligibility
                </p>
              </div>
              <Switch
                checked={settings.matchingRulesEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("matchingRulesEnabled", checked)
                }
                disabled={isSaving}
                className="data-[state=checked]:bg-[#1aa6a3]"
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#d7dbe0] bg-[#f9fafb] px-10 py-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-4xl font-extrabold text-[#202124]">
                  Blood Test Options
                </h3>
                <p className="mt-2 text-[16px] text-[#6b7280]">
                  Configure user capabilities related to blood test results
                </p>
              </div>
              <Switch
                checked={
                  settings.bloodTestAllowUpload || settings.bloodTestAllowOrder
                }
                onCheckedChange={handleBloodTestToggle}
                disabled={isSaving}
                className="data-[state=checked]:bg-[#1aa6a3]"
              />
            </div>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                className="flex items-center gap-3 text-[16px] text-[#222]"
                onClick={() =>
                  updateSetting(
                    "bloodTestAllowUpload",
                    !settings.bloodTestAllowUpload,
                  )
                }
                disabled={isSaving}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded border ${
                    settings.bloodTestAllowUpload
                      ? "border-[#1aa6a3] bg-[#1aa6a3] text-white"
                      : "border-[#c7cdd3] bg-white text-transparent"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
                Allow users to upload blood test results.
              </button>

              <button
                type="button"
                className="flex items-center gap-3 text-[16px] text-[#222]"
                onClick={() =>
                  updateSetting(
                    "bloodTestAllowOrder",
                    !settings.bloodTestAllowOrder,
                  )
                }
                disabled={isSaving}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded border ${
                    settings.bloodTestAllowOrder
                      ? "border-[#1aa6a3] bg-[#1aa6a3] text-white"
                      : "border-[#c7cdd3] bg-white text-transparent"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
                Allow users to order blood tests
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
