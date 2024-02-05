import { SettingsData, settingsRepository } from '../models';
import DataLoader from 'dataloader';

let settingsLoader: DataLoader<number, SettingsData>;

export const initSettingsLoader = () => {
  settingsLoader = new DataLoader(async () => {
    const s = await settingsRepository.get();
    return [s.toObject() as SettingsData];
  });
};

export async function getAppSettings(): Promise<SettingsData> {
  const s = await settingsLoader.load(0);
  return s;
}

export async function updateAppSettings(data: SettingsData): Promise<void> {
  await settingsRepository.put(data);
  settingsLoader.clear(0);
}
