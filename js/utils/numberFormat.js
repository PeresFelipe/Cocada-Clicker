export function formatNumber(value, options = {}) {
  const { minimumFractionDigits = 0, maximumFractionDigits = 2 } = options;

  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

export function formatPercent(value) {
  return `${formatNumber(value * 100)}%`;
}

export function formatFixed2(value) {
  return formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
