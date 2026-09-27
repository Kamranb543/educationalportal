// lib/config.ts — Single accessor for the institution config and terminology.
// Never import `institution.config.ts` directly in components; go through here.
import {
  defaultInstitutionConfig,
  type InstitutionConfig,
} from "@/institution.config";

export const config: InstitutionConfig = defaultInstitutionConfig;

/** Terminology bundle with singular labels used across the shell. */
export const terminology = config.terminology;

/** Active module flags gate sidebar links and feature sections. */
export const enabledModules = config.enabledModules;

export const identity = config.identity;
export const branding = config.branding;
export const localization = config.localization;
