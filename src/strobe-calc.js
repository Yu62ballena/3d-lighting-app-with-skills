import { STROBE_PROFILES } from './strobe-profiles.js';

// Assume a fixed softbox attenuation of 2 stops (reduces light by factor of 4)
const SOFTBOX_ATTENUATION_STOPS = 2.0;
const SOFTBOX_FACTOR = Math.pow(2, SOFTBOX_ATTENUATION_STOPS); // GN effectively halved, power need * 4

/**
 * Calculates the required strobe output based on distance, ISO, F-value, and chosen profile.
 *
 * Required GN = Distance(m) * F-value
 * (Note: if ISO is not 100, we must adjust. GN scales with sqrt(ISO/100).
 * Let GN_base be the GN at ISO 100. Then GN_iso = GN_base * sqrt(ISO/100).
 * Thus, Required GN_base = (Distance * F-value) / sqrt(ISO/100). )
 *
 * Output Power Ratio = (Required GN_base / Strobe_Max_GN_base)^2
 * Compensate for softbox: Output Power Ratio *= SOFTBOX_FACTOR
 * Find nearest step.
 */
export function calculateStrobeOutput(profileId, iso, fValue, distanceCm) {
  const profile = STROBE_PROFILES[profileId];
  if (!profile) return '不明な機種';

  const distanceM = distanceCm / 100;
  if (distanceM <= 0) return '距離が不正';

  // 1. Calculate Required GN at ISO 100
  // Formula: GN = Distance * F
  // Adjust for ISO: GN_100 = (Distance * F) / sqrt(ISO/100)
  const requiredGnAtIso100 = (distanceM * fValue) / Math.sqrt(iso / 100);

  // 2. Calculate Power Ratio
  let powerRatio = Math.pow(requiredGnAtIso100 / profile.gn, 2);

  // 3. Apply softbox attenuation
  powerRatio *= SOFTBOX_FACTOR;

  // 4. Check boundaries
  if (powerRatio > 1.0) {
    return '光量不足 (1/1以上必要)';
  }
  if (powerRatio < profile.steps[0].ratio) {
    return '近すぎ/明るすぎ (1/128未満)';
  }

  // 5. Find nearest 1/3 stop step
  let nearestStep = profile.steps[0];
  let minDiff = Math.abs(powerRatio - nearestStep.ratio);

  for (let i = 1; i < profile.steps.length; i++) {
    const step = profile.steps[i];
    const diff = Math.abs(powerRatio - step.ratio);
    if (diff < minDiff) {
      minDiff = diff;
      nearestStep = step;
    }
  }

  return `約${nearestStep.label}`;
}
