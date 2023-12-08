export class TabSingleton {
  private static tab: chrome.tabs.Tab | null = null;

  public static async getInstance(): Promise<chrome.tabs.Tab | null> {
    if (this.tab !== null) {
      return this.tab;
    }
    return await this.setInstance();
  }

  private static async setInstance(): Promise<chrome.tabs.Tab | null> {
    if (chrome) {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      this.tab = tab;
      return tab;
    }
    return null;
  }
}
