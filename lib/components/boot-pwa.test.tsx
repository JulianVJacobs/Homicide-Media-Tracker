import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BootPWA from './boot-pwa';
import * as dbio from '../utils/db-io';

// Mock db-io functions
jest.mock('../utils/db-io', () => ({
  exportDbToBlob: jest.fn(
    async () => new Blob(['{}'], { type: 'application/json' }),
  ),
  saveBlobToFile: jest.fn(async () => true),
  verifyEvictionMarker: jest.fn(async () => true),
  writeEvictionMarker: jest.fn(async () => true),
  hasAnyData: jest.fn(async () => false),
}));

// Mock fs-utils getStoredDirectoryHandle to return null
jest.mock('../utils/fs-utils', () => ({
  getStoredDirectoryHandle: jest.fn(async () => null),
  storeDirectoryHandle: jest.fn(async () => null),
}));

describe('BootPWA persistence and fallback', () => {
  beforeEach(() => {
    // monkeypatch navigator.storage for test
    Object.defineProperty(window.navigator, 'storage', {
      value: {
        persist: jest.fn(async () => false),
        persisted: jest.fn(async () => false),
        estimate: jest.fn(async () => ({ usage: 100, quota: 200 })),
      },
      configurable: true,
    });
  });

  it('shows fallback download button and calls export/save on click', async () => {
    render(<BootPWA />);

    // Trigger storage-warning event to show modal in component
    window.dispatchEvent(
      new CustomEvent('storage-warning', {
        detail: { usage: 180, quota: 200, pct: 0.9 },
      }),
    );

    await waitFor(() => screen.getByText(/To ensure your data is kept safe/i));

    // If directory picker is not supported, the fallback button should be shown
    const downloadBtn = screen.getByText(/Download backup now/i);
    expect(downloadBtn).toBeTruthy();

    fireEvent.click(downloadBtn);

    // exportDbToBlob/saveBlobToFile mocks are called
    const dbioMocks = dbio as unknown as Record<string, jest.Mock>;
    await waitFor(() => expect(dbioMocks.exportDbToBlob).toHaveBeenCalled());
    await waitFor(() => expect(dbioMocks.saveBlobToFile).toHaveBeenCalled());
  });
});
