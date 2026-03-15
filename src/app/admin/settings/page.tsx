"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCheck, Loader2 } from "lucide-react";
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
    <>
      <div className="-mx-4 -mt-4 mb-8 border-b border-[#e5e7eb] bg-white px-4 py-8 sm:-mx-6 sm:-mt-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8">
        <div className="max-w-5xl">
          <h1 className="text-[28px] font-bold text-[#1f2937]">Settings</h1>
          <p className="mt-1 text-[15px] text-[#6b7280]">
            Manage configuration options for the provider network platform
          </p>
        </div>
      </div>

      <div className="max-w-5xl">
        <section className="mb-10">
        <h2 className="mb-5 text-[22px] font-bold text-[#1f2937]">
          Experience &amp; Content
        </h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[20px] font-bold text-[#1f2937]">
                  Landing Page
                </h3>
                <p className="mt-1 text-[15px] text-[#6b7280]">
                  Configure user facing rules and content.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="h-[38px] rounded-lg border-[#16a3a1] px-5 text-[14px] font-medium text-[#16a3a1] transition-colors hover:bg-[#f0fdfa] hover:text-[#0d9488]"
              >
                <Link href="/admin/settings/landing">
                  Edit
                  <ArrowRight className="ml-2 h-[18px] w-[18px]" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[20px] font-bold text-[#1f2937]">
                  Legal &amp; Policies
                </h3>
                <p className="mt-1 text-[15px] text-[#6b7280]">
                  Manage disclaimers, terms and user agreements
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="h-[38px] rounded-lg border-[#16a3a1] px-5 text-[14px] font-medium text-[#16a3a1] transition-colors hover:bg-[#f0fdfa] hover:text-[#0d9488]"
              >
                <Link href="/admin/settings/legal">
                  Edit
                  <ArrowRight className="ml-2 h-[18px] w-[18px]" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-[22px] font-bold text-[#1f2937]">
          System &amp; Logic
        </h2>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[20px] font-bold text-[#1f2937]">
                  Matching Rules
                </h3>
                <p className="mt-1 text-[15px] text-[#6b7280]">
                  Enable or disable matching rules for pathway eligibility
                </p>
              </div>
              <Switch
                checked={settings.matchingRulesEnabled}
                onCheckedChange={(checked) =>
                  updateSetting("matchingRulesEnabled", checked)
                }
                disabled={isSaving}
                className="data-[state=checked]:bg-[#16a3a1]"
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[20px] font-bold text-[#1f2937]">
                  Blood Test Options
                </h3>
                <p className="mt-1 text-[15px] text-[#6b7280]">
                  Configure user capabilities related to blood test results
                </p>
              </div>
              <Switch
                checked={
                  settings.bloodTestAllowUpload || settings.bloodTestAllowOrder
                }
                onCheckedChange={handleBloodTestToggle}
                disabled={isSaving}
                className="data-[state=checked]:bg-[#16a3a1]"
              />
            </div>

            <div className="mt-6 space-y-3 px-2">
              <button
                type="button"
                className="flex items-center gap-3 text-[14px] text-[#4b5563] transition-colors hover:text-[#1f2937]"
                onClick={() =>
                  updateSetting(
                    "bloodTestAllowUpload",
                    !settings.bloodTestAllowUpload,
                  )
                }
                disabled={isSaving}
              >
                <CheckCheck
                  className={`h-[18px] w-[18px] ${
                    settings.bloodTestAllowUpload
                      ? "text-[#1f2937]"
                      : "text-transparent"
                  }`}
                />
                Allow users to upload blood test results.
              </button>

              <button
                type="button"
                className="flex items-center gap-3 text-[14px] text-[#4b5563] transition-colors hover:text-[#1f2937]"
                onClick={() =>
                  updateSetting(
                    "bloodTestAllowOrder",
                    !settings.bloodTestAllowOrder,
                  )
                }
                disabled={isSaving}
              >
                <CheckCheck
                  className={`h-[18px] w-[18px] ${
                    settings.bloodTestAllowOrder
                      ? "text-[#1f2937]"
                      : "text-transparent"
                  }`}
                />
                Allow users to order blood tests
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
