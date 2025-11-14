// Ambil tanggal UTC (bukan lokal)
function getTodayUTC() {
  const now = new Date();
  return now.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

export function mark(type, address) {
  const key = `ritual_${address}_${type}`;
  const today = getTodayUTC();
  localStorage.setItem(key, today);
}

export function isCooldown(type, address) {
  const key = `ritual_${address}_${type}`;
  const stored = localStorage.getItem(key);
  const today = getTodayUTC();
  return stored === today; // cooldown aktif
}

// Reset otomatis setiap hari UTC
export function autoReset(address) {
  const types = ["GM", "GN", "SLEEP"];
  const today = getTodayUTC();

  types.forEach((t) => {
    const key = `ritual_${address}_${t}`;
    const stored = localStorage.getItem(key);
    if (stored && stored !== today) {
      localStorage.removeItem(key); // RESET
    }
  });
}
