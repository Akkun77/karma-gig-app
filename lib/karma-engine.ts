export interface KarmaInputs {
  hours: number; // 0.5–5
  mentalEffort: number; // 1–5
  physicalEffort: number; // 1–5
  urgent: boolean;
}

export function calculateKarma(inputs: KarmaInputs): number {
  const { hours, mentalEffort, physicalEffort, urgent } = inputs;
  return (
    10 +
    hours * 15 +
    mentalEffort * 5 +
    physicalEffort * 5 +
    (urgent ? 20 : 0)
  );
}
