export function formatConfidence(value: number | null): string {
  if (value === null || !Number.isFinite(value) || value < 0 || value > 1) {
    return 'Не предоставлен';
  }
  return `${Math.round(value * 100)}/100`;
}

export const confidenceExplanation = 'Самооценка модели в описании действия. Вероятность нарушения не рассчитана.';
