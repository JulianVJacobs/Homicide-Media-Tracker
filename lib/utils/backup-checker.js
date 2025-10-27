// lightweight helper to run a fallback backup when no stored directory handle
async function runFallbackBackup({ exportDbToBlob, saveBlobToFile, getStoredDirectoryHandle, fileName = 'homicide-db.json' }) {
  const handle = await getStoredDirectoryHandle('backup-folder');
  if (handle) return { skipped: true };
  const blob = await exportDbToBlob();
  await saveBlobToFile(blob, fileName);
  return { skipped: false };
}

module.exports = { runFallbackBackup };
