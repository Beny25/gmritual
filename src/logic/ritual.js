// === Cooldown Logic ===

function getTodayUTC() {
  const now = new Date();
  return now.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function mark(type, address) {
  const key = `ritual_${type}_${address}`;
  localStorage.setItem(key, getTodayUTC());
}

export function isCooldown(type, address) {
  const key = `ritual_${type}_${address}`;
  const last = localStorage.getItem(key);
  if (!last) return false;

  return last === getTodayUTC(); // Cooldown sampai reset pukul 00 UTC
}

export function getCooldownRemaining(type, address) {
  if (!isCooldown(type, address)) return 0;

  const now = new Date();
  const nextUTC = new Date(now);
  nextUTC.setUTCHours(24, 0, 0, 0); // Reset jam 00 UTC berikutnya

  return Math.max(0, nextUTC - now);
}

export function autoReset(address) {
  ["GM", "GN", "SLEEP"].forEach((type) => {
    if (!isCooldown(type, address)) {
      localStorage.removeItem(`ritual_${type}_${address}`);
    }
  });
}
