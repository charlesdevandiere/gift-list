export class AppStorage {

  public constructor(private readonly storage: Storage) { }

  public getItem<T>(key: string): T | null {
    const value: string | null = this.storage.getItem(key);

    if (value === null) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  public setItem<T>(key: string, item: T): void {
    const value: string = JSON.stringify(item);
    this.storage.setItem(key, value);
  }

  public removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  public clear(): void {
    this.storage.clear();
  }

}
