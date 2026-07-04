export const formatNumber = (value, maxDigits = 1) => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxDigits
  }).format(value);
};

export const formatValue = (value, indicator) => {
  if (indicator.format === "currencyDecimal") return `$${formatNumber(value, 3)}B`;
  if (indicator.format === "krwTrillion") return `${formatNumber(value, 3)}조원`;
  if (indicator.format === "index") return formatNumber(value, 1);
  if (indicator.format === "currency") return `$${Math.round(value)}B`;
  if (indicator.format === "percent") return `${Math.round(value)}%`;
  return `${Math.round(value)}`;
};

export const formatDeltaValue = (value, indicator) => {
  const absolute = Math.abs(value);
  if (indicator.format === "currencyDecimal") return `$${formatNumber(absolute, 3)}B`;
  if (indicator.format === "krwTrillion") return `${formatNumber(absolute, 3)}조원`;
  if (indicator.format === "index") return `${formatNumber(absolute, 1)}p`;
  if (indicator.format === "currency") return `$${formatNumber(absolute, 1)}B`;
  if (indicator.format === "percent") return `${formatNumber(absolute, 1)}pt`;
  return formatNumber(absolute, 1);
};

export const trendInfo = indicator => {
  const values = indicator.series[0].values;
  const first = values[0];
  const last = values[values.length - 1];
  const delta = last - first;
  const percent = first === 0 ? null : (delta / first) * 100;
  const sign = delta > 0 ? "+" : delta < 0 ? "-" : "";
  const direction = delta > 0 ? "상승" : delta < 0 ? "하락" : "변화 없음";

  return {
    delta,
    percent,
    direction,
    deltaLabel: `${indicator.labels[0]} 이후 ${sign}${formatDeltaValue(delta, indicator)}`,
    percentLabel: percent === null ? "" : `${sign}${formatNumber(Math.abs(percent), 1)}%`
  };
};

export const normalizeValues = values => {
  const base = values[0] || 1;
  return values.map(value => (value / base) * 100);
};
