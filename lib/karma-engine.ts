export interface KarmaInputs {
  hours: number; // 0.5–5
  mentalEffort: number; // 1–5
  physicalEffort: number; // 1–5
  urgent: boolean;
}

export function calculateKarma(inputs: KarmaInputs): number {
  const { hours, mentalEffort, physicalEffort, urgent } = inputs;
  
  // Adjusted pricing based on the new logic:
  // heavily weighting mental effort over physical effort.
  // 1 hr intense mental work (m:4, p:1) -> 50
  // 1 hr physical delivery (m:1, p:4) -> 30
  
  return Math.round(
    5 + // base flat fee
    (hours * 10) + // flat hourly component
    (mentalEffort * 8.5) + // high premium on skilled mental work
    (physicalEffort * 1.5) + // lower impact for baseline physical effort
    (urgent ? 15 : 0)
  );
}
