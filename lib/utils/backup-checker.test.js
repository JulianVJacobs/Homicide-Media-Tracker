import { runFallbackBackup } from './backup-checker';

describe('backup checker helper', () => {
  it('calls export and save when no stored directory handle', async () => {
    const exportDbToBlob = jest.fn(async () => new Blob(['{}'], { type: 'application/json' }));
    const saveBlobToFile = jest.fn(async () => true);
    const getStoredDirectoryHandle = jest.fn(async () => null);

    const res = await runFallbackBackup({ exportDbToBlob, saveBlobToFile, getStoredDirectoryHandle, fileName: 'test.json' });
    expect(res.skipped).toBe(false);
    expect(exportDbToBlob).toHaveBeenCalled();
    expect(saveBlobToFile).toHaveBeenCalled();
  });

  it('does not call export/save when directory handle exists', async () => {
    const exportDbToBlob = jest.fn(async () => new Blob(['{}'], { type: 'application/json' }));
    const saveBlobToFile = jest.fn(async () => true);
    const getStoredDirectoryHandle = jest.fn(async () => ({ name: 'mydir' }));

    const res = await runFallbackBackup({ exportDbToBlob, saveBlobToFile, getStoredDirectoryHandle, fileName: 'test.json' });
    expect(res.skipped).toBe(true);
    expect(exportDbToBlob).not.toHaveBeenCalled();
    expect(saveBlobToFile).not.toHaveBeenCalled();
  });
});
import { runFallbackBackup } from './backup-checker';

describe('backup checker helper', () => {
  it('calls export and save when no stored directory handle', async () => {
    const exportDbToBlob = jest.fn(async () => new Blob(['{}'], { type: 'application/json' }));
    const saveBlobToFile = jest.fn(async () => true);
    const getStoredDirectoryHandle = jest.fn(async () => null);

    const res = await runFallbackBackup({ exportDbToBlob, saveBlobToFile, getStoredDirectoryHandle, fileName: 'test.json' });
    expect(res.skipped).toBe(false);
    expect(exportDbToBlob).toHaveBeenCalled();
    expect(saveBlobToFile).toHaveBeenCalled();
  });

  it('does not call export/save when directory handle exists', async () => {
    const exportDbToBlob = jest.fn(async () => new Blob(['{}'], { type: 'application/json' }));
    const saveBlobToFile = jest.fn(async () => true);
    const getStoredDirectoryHandle = jest.fn(async () => ({ name: 'mydir' }));

    const res = await runFallbackBackup({ exportDbToBlob, saveBlobToFile, getStoredDirectoryHandle, fileName: 'test.json' });
    expect(res.skipped).toBe(true);
    expect(exportDbToBlob).not.toHaveBeenCalled();
    expect(saveBlobToFile).not.toHaveBeenCalled();
  });
});
