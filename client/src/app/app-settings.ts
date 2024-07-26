import { Injectable } from '@angular/core';

@Injectable()
export class AppSettings {

  public apiUrl = '';

  public async load(): Promise<void> {
    try {
      const response = await fetch(`app-setting.json`);
      if (!response.ok) {
        throw new Error('Request failed.');
      }
      const settings = await response.json() as AppSettings;
      Object.assign(this, settings);
    } catch (error) {
      console.error('Failed to load app-settings.', error);
    }
  }
}
