import { useState, useEffect } from 'react';
import { platform } from '@tauri-apps/plugin-os';

export type Platform = 'macos' | 'windows' | 'linux' | 'unknown';

export function usePlatform() {
  const [currentPlatform, setCurrentPlatform] = useState<Platform>('unknown');

  useEffect(() => {
    async function getPlatform() {
      try {
        const platformName = await platform();
        setCurrentPlatform(platformName as Platform);
      } catch {
        setCurrentPlatform('unknown');
      }
    }
    
    getPlatform();
  }, []);

  return currentPlatform;
}