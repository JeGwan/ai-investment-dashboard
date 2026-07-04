import { formatNumber, normalizeValues } from "./formatters.js";

export const palette = ["#2878c8", "#0f8b5f", "#a96f00", "#c23b3b", "#5f5aa2"];

const resizeCanvas = canvas => {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(320, Math.floor(rect.width * dpr));
  canvas.height = Math.max(180, Math.floor(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
};

export const drawChart = (canvas, indicator, options = {}) => {
  if (!canvas || !indicator) return;

  const { ctx, width, height } = resizeCanvas(canvas);
  const labels = indicator.labels;
  const series = indicator.series.map(item => ({
    label: item.label,
    values: options.normalized ? normalizeValues(item.values) : item.values
  }));
  const padding = options.mini
    ? { top: 14, right: 12, bottom: 22, left: 30 }
    : { top: 26, right: 34, bottom: 46, left: 58 };

  ctx.clearRect(0, 0, width, height);

  const allValues = series.flatMap(item => item.values);
  const minRaw = Math.min(...allValues);
  const maxRaw = Math.max(...allValues);
  const spread = Math.max(1, maxRaw - minRaw);
  const yMin = minRaw - spread * 0.12;
  const yMax = maxRaw + spread * 0.12;

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const xFor = index => padding.left + (plotW * index) / Math.max(1, labels.length - 1);
  const yFor = value => padding.top + ((yMax - value) / (yMax - yMin)) * plotH;

  ctx.strokeStyle = "#e6ebf0";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#66717d";
  ctx.font = options.mini ? "10px system-ui" : "12px system-ui";

  const gridCount = options.mini ? 3 : 5;
  for (let i = 0; i <= gridCount; i += 1) {
    const y = padding.top + (plotH * i) / gridCount;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    if (!options.mini) {
      const value = yMax - ((yMax - yMin) * i) / gridCount;
      ctx.fillText(formatNumber(value, 1), 12, y + 4);
    }
  }

  if (!options.mini) {
    const labelStep = Math.max(1, Math.ceil(labels.length / 7));
    labels.forEach((label, index) => {
      if (index % labelStep === 0 || index === labels.length - 1) {
        ctx.fillText(label, xFor(index) - 20, height - 16);
      }
    });
  } else {
    ctx.fillText(labels[0], padding.left - 12, height - 8);
    ctx.fillText(labels[labels.length - 1], width - padding.right - 38, height - 8);
  }

  series.forEach((item, seriesIndex) => {
    ctx.strokeStyle = palette[seriesIndex % palette.length];
    ctx.lineWidth = options.mini ? 2 : 3;
    ctx.beginPath();

    item.values.forEach((value, index) => {
      const x = xFor(index);
      const y = yFor(value);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    item.values.forEach((value, index) => {
      const x = xFor(index);
      const y = yFor(value);
      ctx.fillStyle = palette[seriesIndex % palette.length];
      ctx.beginPath();
      ctx.arc(x, y, options.mini ? 2.5 : 4, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  if (!options.mini && series.length > 1) {
    series.forEach((item, index) => {
      ctx.fillStyle = palette[index % palette.length];
      ctx.fillRect(width - 210, 18 + index * 20, 10, 10);
      ctx.fillStyle = "#26313c";
      ctx.fillText(item.label, width - 194, 28 + index * 20);
    });
  }
};
