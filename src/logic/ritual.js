// Key builder (per tombol per address)
export function cdKey(type, address) {
  return `cool_${type}_${address}`;
}

// Simpan UTC date hari ini
export function mark(type, address) {
  const todayUTC = new Date().toISOString().slice(0, 10);
  localStorage.setItem(cdKey(type, address), todayUTC);
}

// Cek apakah tombol ini sudah pernah dipakai hari ini
export function isCooldown(type, address) {
  if (!address) return true;
  const saved = localStorage.getItem(cdKey(type, address));
  const todayUTC = new Date().toISOString().slice(0, 10);
  return saved === todayUTC;
}

// Hapus cooldown yang sudah masuk hari baru
export function autoReset(address) {
  const todayUTC = new Date().toISOString().slice(0, 10);

  ["GM", "GN", "SLEEP"].forEach(type => {
    const saved = localStorage.getItem(cdKey(type, address));
    if (saved && saved !== todayUTC) {
      localStorage.removeItem(cdKey(type, address));
    }
  });
}

export function nextResetUTC() {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0
  ));
}

export function getCountdown() {
  const now = new Date();
  const next = nextResetUTC();
  const diff = Math.max(next - now, 0);

  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return { h, m, s };
}
