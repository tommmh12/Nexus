import { SettingsRepository } from "../../infrastructure/repositories/SettingsRepository.js";

export class SettingsService {
  private settingsRepo = new SettingsRepository();

  async getTaskSettings() {
    return await this.settingsRepo.getTaskSettings();
  }

  async getPriorities() {
    return await this.settingsRepo.getPriorities();
  }

  async getTags() {
    return await this.settingsRepo.getTags();
  }

  async getStatuses() {
    return await this.settingsRepo.getStatuses();
  }
}
