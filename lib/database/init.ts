import { databaseManager } from './connection';

export async function ensureDatabaseInitialized() {
  // Check if localDb is initialized
  if (
    !databaseManager.getLocal ||
    (() => {
      try {
        databaseManager.getLocal();
        return true;
      } catch {
        return false;
      }
    })() === false
  ) {
    await databaseManager.initialiseLocal();
  }
}
