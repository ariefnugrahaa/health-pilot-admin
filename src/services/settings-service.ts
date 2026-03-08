/**
 * Settings Service
 * Handles all settings-related API calls for the admin dashboard
 */

import { api } from "@/lib/api-client";

// ============================================
// Types
// ============================================

export interface HeroSection {
  headline: string;
  subtext: string;
}

export interface ServiceCard {
  title: string;
  description: string;
  ctaButtonLabel: string;
  showRecommendedBadge: boolean;
}

export type TrustHighlightIcon = "medical" | "encrypted" | "payment";

export interface InfoBanner {
  enabled: boolean;
  description: string;
}

export interface TrustHighlight {
  icon: TrustHighlightIcon;
  title: string;
  description: string;
}

export interface LandingExperience {
  hero: HeroSection;
  guidedHealthCheck: ServiceCard;
  fullBloodTest: ServiceCard;
  infoBanner: InfoBanner;
  trustHighlights: TrustHighlight[];
}

export interface LandingPageSettings {
  beforeLogin: LandingExperience;
  afterLogin: LandingExperience;
}

export interface SystemSettings {
  matchingRulesEnabled: boolean;
  bloodTestAllowUpload: boolean;
  bloodTestAllowOrder: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { timestamp: string };
  error?: { code: string; message: string };
}

// ============================================
// Landing Page Settings
// ============================================

/**
 * Get landing page settings
 */
export async function getLandingPageSettings(): Promise<LandingPageSettings> {
  const res = await api.get("/admin/settings/landing");

  const data: ApiResponse<LandingPageSettings> = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(
      data.error?.message || "Failed to fetch landing page settings",
    );
  }

  return data.data;
}

/**
 * Update landing page settings
 */
export async function updateLandingPageSettings(
  settings: LandingPageSettings,
): Promise<LandingPageSettings> {
  const res = await api.put("/admin/settings/landing", settings);

  const data: ApiResponse<LandingPageSettings> = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(
      data.error?.message || "Failed to update landing page settings",
    );
  }

  return data.data;
}

// ============================================
// System Settings
// ============================================

/**
 * Get system settings
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  const res = await api.get("/admin/settings/system");

  const data: ApiResponse<SystemSettings> = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Failed to fetch system settings");
  }

  return data.data;
}

/**
 * Update system settings
 */
export async function updateSystemSettings(
  settings: SystemSettings,
): Promise<SystemSettings> {
  const res = await api.put("/admin/settings/system", settings);

  const data: ApiResponse<SystemSettings> = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Failed to update system settings");
  }

  return data.data;
}

// ============================================
// Generic Settings
// ============================================

/**
 * Get all settings
 */
export async function getAllSettings(): Promise<Record<string, unknown>> {
  const res = await api.get("/admin/settings");

  const data: ApiResponse<Record<string, unknown>> = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Failed to fetch settings");
  }

  return data.data;
}

/**
 * Get setting by key
 */
export async function getSetting(key: string): Promise<unknown> {
  const res = await api.get(`/admin/settings/${key}`);

  const data: ApiResponse<{ key: string; value: unknown }> = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Failed to fetch setting");
  }

  return data.data.value;
}

/**
 * Update setting by key
 */
export async function updateSetting(
  key: string,
  value: unknown,
  description?: string,
): Promise<unknown> {
  const res = await api.put(`/admin/settings/${key}`, { value, description });

  const data: ApiResponse<unknown> = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || "Failed to update setting");
  }

  return data.data;
}
