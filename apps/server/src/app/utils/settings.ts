import { SettingsData, settingsRepository } from '../models';

export async function getAppSettings(): Promise<SettingsData> {
  const s = await settingsRepository.get();
  return s.toObject();
}

export async function updateAppSettings(data: SettingsData): Promise<void> {
  await settingsRepository.put(data);
}
