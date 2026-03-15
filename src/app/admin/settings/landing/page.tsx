"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  BriefcaseMedical,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getLandingPageSettings,
  updateLandingPageSettings,
  type LandingExperience,
  type LandingPageSettings,
  type ServiceCard,
  type TrustHighlight,
  type TrustHighlightIcon,
} from "@/services/settings-service";

const defaultExperienceBefore: LandingExperience = {
  hero: {
    headline: "Get personalised health guidance based on your unique profile",
    subtext:
      "HealthPilot offers tailored insights into your wellbeing. Our system provides guidance only, empowering you with knowledge. No preparation needed. Simply choose your path to begin.",
  },
  guidedHealthCheck: {
    title: "Start Guided Health Check",
    description:
      "Answer a few questions to receive personalised guidance. You can upload blood test results now or later if available.",
    ctaButtonLabel: "Get Started",
    showRecommendedBadge: true,
  },
  fullBloodTest: {
    title: "Full Blood Test Analysis",
    description:
      "Upload an existing blood test or order a new test through HealthPilot, then return to continue your health check.",
    ctaButtonLabel: "Start Blood Test",
    showRecommendedBadge: true,
  },
  infoBanner: {
    enabled: true,
    description:
      "You can begin without any preparation. The system will guide you step by step.",
  },
  trustHighlights: [
    {
      icon: "medical",
      title: "Not a medical diagnosis",
      description: "Guidance only, supporting your health journey.",
    },
    {
      icon: "encrypted",
      title: "Private and secure data",
      description: "Your information is protected with advanced encryption.",
    },
    {
      icon: "payment",
      title: "No payment required",
      description: "Free to begin exploring your personalised health insights.",
    },
  ],
};

const defaultExperienceAfter: LandingExperience = {
  ...defaultExperienceBefore,
  hero: {
    headline: "Welcome back to HealthPilot",
    subtext:
      "Based on your last health check, you can continue your journey or start a new one anytime.",
  },
};

const defaultSettings: LandingPageSettings = {
  beforeLogin: defaultExperienceBefore,
  afterLogin: defaultExperienceAfter,
};

type LandingTab = "before-login" | "after-login";
type TabKey = "beforeLogin" | "afterLogin";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between bg-white px-6 py-4 transition-colors hover:bg-[#f9fafb] ${isOpen ? "border-b border-[#e5e7eb]" : ""}`}
      >
        <h3 className="text-[17px] font-bold text-[#1f2937]">{title}</h3>
        <ChevronUp className={`h-5 w-5 text-[#9ca3af] transition-transform duration-200 ${isOpen ? "" : "rotate-180"}`} />
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-6 py-6">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPageSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LandingTab>("before-login");
  const [settings, setSettings] =
    useState<LandingPageSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeKey: TabKey =
    activeTab === "before-login" ? "beforeLogin" : "afterLogin";

  const activeSettings = useMemo(
    () => settings[activeKey],
    [activeKey, settings],
  );

  useEffect(() => {
    const run = async () => {
      try {
        setError(null);
        const data = await getLandingPageSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
        setError("Using default values, failed to load saved settings.");
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, []);

  const updateActiveExperience = (
    updater: (experience: LandingExperience) => LandingExperience,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [activeKey]: updater(prev[activeKey]),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const saved = await updateLandingPageSettings(settings);
      setSettings(saved);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError("Failed to publish changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateHero = (field: "headline" | "subtext", value: string) => {
    updateActiveExperience((experience) => ({
      ...experience,
      hero: { ...experience.hero, [field]: value },
    }));
  };

  const updateServiceCard = (
    card: "guidedHealthCheck" | "fullBloodTest",
    field: keyof ServiceCard,
    value: string | boolean,
  ) => {
    updateActiveExperience((experience) => ({
      ...experience,
      [card]: { ...experience[card], [field]: value },
    }));
  };

  const updateInfoBanner = (
    field: "enabled" | "description",
    value: string | boolean,
  ) => {
    updateActiveExperience((experience) => ({
      ...experience,
      infoBanner: { ...experience.infoBanner, [field]: value },
    }));
  };

  const updateTrustHighlight = (
    index: number,
    field: keyof TrustHighlight,
    value: string,
  ) => {
    updateActiveExperience((experience) => ({
      ...experience,
      trustHighlights: experience.trustHighlights.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
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
      <div className="-mx-4 -mt-4 mb-8 bg-white px-4 pt-6 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-8 lg:-mx-8 lg:-mt-8 lg:px-8 lg:pt-8">
        <div>
          <button
            type="button"
            onClick={() => router.push("/admin/settings")}
            className="mb-8 inline-flex items-center gap-2 text-[14px] font-medium text-[#16a3a1] transition-colors hover:text-[#138f8d]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </button>

          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#1f2937]">
              Landing Settings
            </h1>
            <p className="mt-1.5 text-[15px] text-[#6b7280]">
              Manage content and visibility for the homepage.
            </p>
          </div>

          <div className="mt-8 border-b border-[#e5e7eb]">
            <nav className="-mb-px flex space-x-8">
              <button
                type="button"
                onClick={() => setActiveTab("before-login")}
                className={`whitespace-nowrap border-b-2 py-3 text-[14px] font-medium transition-colors ${
                  activeTab === "before-login"
                    ? "border-[#16a3a1] text-[#16a3a1]"
                    : "border-transparent text-[#6b7280] hover:text-[#374151]"
                }`}
              >
                Before Login
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("after-login")}
                className={`whitespace-nowrap border-b-2 py-3 text-[14px] font-medium transition-colors ${
                  activeTab === "after-login"
                    ? "border-[#16a3a1] text-[#16a3a1]"
                    : "border-transparent text-[#6b7280] hover:text-[#374151]"
                }`}
              >
                After Login
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="flex max-w-5xl flex-col gap-6 pb-20">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-[#f3d6a8] bg-[#fff9ed] px-4 py-3 text-[#8a5a00]">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <Section title="Hero Section">
          <div className="space-y-5">
            <div>
              <Label className="text-[14px] font-bold text-[#374151]">
                Hero Headline
              </Label>
              <Input
                value={activeSettings.hero.headline}
                onChange={(e) => updateHero("headline", e.target.value)}
                className="mt-1.5 h-10 border-[#d1d5db] text-[#1f2937] placeholder-[#9ca3af] focus-visible:ring-[#16a3a1]"
              />
            </div>
            <div>
              <Label className="text-[14px] font-bold text-[#374151]">
                Hero Subtext
              </Label>
              <Textarea
                value={activeSettings.hero.subtext}
                onChange={(e) => updateHero("subtext", e.target.value)}
                className="mt-1.5 min-h-[90px] w-full border-[#d1d5db] text-[#1f2937] placeholder-[#9ca3af] focus-visible:ring-[#16a3a1]"
              />
            </div>
          </div>
        </Section>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          <Section title="Guided Health Check Card">
            <div className="space-y-5">
              <div>
                <Label className="text-[14px] font-bold text-[#374151]">
                  Card Title
                </Label>
                <Input
                  value={activeSettings.guidedHealthCheck.title}
                  onChange={(e) =>
                    updateServiceCard(
                      "guidedHealthCheck",
                      "title",
                      e.target.value,
                    )
                  }
                  className="mt-1.5 h-10 border-[#d1d5db] focus-visible:ring-[#16a3a1]"
                />
              </div>
              <div>
                <Label className="text-[14px] font-bold text-[#374151]">
                  Description
                </Label>
                <Textarea
                  value={activeSettings.guidedHealthCheck.description}
                  onChange={(e) =>
                    updateServiceCard(
                      "guidedHealthCheck",
                      "description",
                      e.target.value,
                    )
                  }
                  className="mt-1.5 min-h-[100px] border-[#d1d5db] focus-visible:ring-[#16a3a1]"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-[14px] font-medium text-[#4b5563]">
                <input
                  type="checkbox"
                  checked={
                    activeSettings.guidedHealthCheck.showRecommendedBadge
                  }
                  onChange={(e) =>
                    updateServiceCard(
                      "guidedHealthCheck",
                      "showRecommendedBadge",
                      e.target.checked,
                    )
                  }
                  className="h-4 w-4 rounded border-[#d1d5db] text-[#16a3a1] accent-[#16a3a1] focus:ring-[#16a3a1]"
                />
                Show "Recommended" Badge
              </label>

              <div>
                <Label className="text-[14px] font-bold text-[#374151]">
                  CTA Button Label
                </Label>
                <Input
                  value={activeSettings.guidedHealthCheck.ctaButtonLabel}
                  onChange={(e) =>
                    updateServiceCard(
                      "guidedHealthCheck",
                      "ctaButtonLabel",
                      e.target.value,
                    )
                  }
                  className="mt-1.5 h-10 border-[#d1d5db] focus-visible:ring-[#16a3a1]"
                />
              </div>
            </div>
          </Section>

          <Section title="Full Blood Test Card">
            <div className="space-y-5">
              <div>
                <Label className="text-[14px] font-bold text-[#374151]">
                  Card Title
                </Label>
                <Input
                  value={activeSettings.fullBloodTest.title}
                  onChange={(e) =>
                    updateServiceCard("fullBloodTest", "title", e.target.value)
                  }
                  className="mt-1.5 h-10 border-[#d1d5db] focus-visible:ring-[#16a3a1]"
                />
              </div>
              <div>
                <Label className="text-[14px] font-bold text-[#374151]">
                  Description
                </Label>
                <Textarea
                  value={activeSettings.fullBloodTest.description}
                  onChange={(e) =>
                    updateServiceCard(
                      "fullBloodTest",
                      "description",
                      e.target.value,
                    )
                  }
                  className="mt-1.5 min-h-[100px] border-[#d1d5db] focus-visible:ring-[#16a3a1]"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-[14px] font-medium text-[#4b5563]">
                <input
                  type="checkbox"
                  checked={activeSettings.fullBloodTest.showRecommendedBadge}
                  onChange={(e) =>
                    updateServiceCard(
                      "fullBloodTest",
                      "showRecommendedBadge",
                      e.target.checked,
                    )
                  }
                  className="h-4 w-4 rounded border-[#d1d5db] text-[#16a3a1] accent-[#16a3a1] focus:ring-[#16a3a1]"
                />
                Show "Recommended" Badge
              </label>

              <div>
                <Label className="text-[14px] font-bold text-[#374151]">
                  CTA Button Label
                </Label>
                <Input
                  value={activeSettings.fullBloodTest.ctaButtonLabel}
                  onChange={(e) =>
                    updateServiceCard(
                      "fullBloodTest",
                      "ctaButtonLabel",
                      e.target.value,
                    )
                  }
                  className="mt-1.5 h-10 border-[#d1d5db] focus-visible:ring-[#16a3a1]"
                />
              </div>
            </div>
          </Section>
        </div>

        <Section title="Info Banner">
          <div className="space-y-5">
            <label className="flex cursor-pointer items-center gap-2 text-[14px] font-medium text-[#4b5563]">
              <input
                type="checkbox"
                checked={activeSettings.infoBanner.enabled}
                onChange={(e) => updateInfoBanner("enabled", e.target.checked)}
                className="h-4 w-4 rounded border-[#d1d5db] text-[#16a3a1] accent-[#16a3a1] focus:ring-[#16a3a1]"
              />
              Show Info Banner
            </label>

            <div>
              <Label className="text-[14px] font-bold text-[#374151]">
                Description
              </Label>
              <Textarea
                value={activeSettings.infoBanner.description}
                onChange={(e) =>
                  updateInfoBanner("description", e.target.value)
                }
                className="mt-1.5 min-h-[90px] border-[#d1d5db] focus-visible:ring-[#16a3a1]"
              />
            </div>
          </div>
        </Section>

        <Section title="Trust Highlights">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            {activeSettings.trustHighlights.map((item, index) => (
              <div key={index} className="space-y-4">
                <h4 className="text-[16px] font-bold text-[#1f2937]">
                  Icon {index + 1}
                </h4>
                <div>
                  <Label className="text-[14px] font-bold text-[#374151]">
                    Icon
                  </Label>
                  <Select
                    value={item.icon}
                    onValueChange={(value) =>
                      updateTrustHighlight(
                        index,
                        "icon",
                        value as TrustHighlightIcon,
                      )
                    }
                  >
                    <SelectTrigger className="mt-1.5 h-10 w-full border-[#d1d5db] focus:ring-[#16a3a1]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical">
                        <div className="flex items-center gap-2">
                          <BriefcaseMedical className="h-4 w-4 text-[#6b7280]" />
                          Medical
                        </div>
                      </SelectItem>
                      <SelectItem value="encrypted">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-[#6b7280]" />
                          Encrypted
                        </div>
                      </SelectItem>
                      <SelectItem value="payment">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-[#6b7280]" />
                          Payment
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[14px] font-bold text-[#374151]">
                    Title
                  </Label>
                  <Input
                    value={item.title}
                    onChange={(e) =>
                      updateTrustHighlight(index, "title", e.target.value)
                    }
                    className="mt-1.5 h-10 border-[#d1d5db] focus-visible:ring-[#16a3a1]"
                  />
                </div>
                <div>
                  <Label className="text-[14px] font-bold text-[#374151]">
                    Description
                  </Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) =>
                      updateTrustHighlight(index, "description", e.target.value)
                    }
                    className="mt-1.5 min-h-[90px] border-[#d1d5db] focus-visible:ring-[#16a3a1]"
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <div className="flex items-center justify-end gap-4 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/admin/settings")}
            className="h-11 px-4 text-[15px] font-semibold text-[#16a3a1] transition-colors hover:bg-transparent hover:text-[#138f8d]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-11 rounded-md bg-[#16a3a1] px-8 text-[15px] font-semibold text-white transition-colors hover:bg-[#138f8d]"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publish Changes
          </Button>
        </div>
      </div>
    </>
  );
}

