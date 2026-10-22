/**
 * Screen Wake Lock API Manager for Kitchen Display System.
 * Keeps the kitchen screen awake during busy service shifts.
 */

class WakeLockManager {
  private sentinel: any = null;
  private isSupported: boolean = false;
  private isActive: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.isSupported = "wakeLock" in navigator;
    }
  }

  public async requestLock(): Promise<boolean> {
    if (typeof window === "undefined" || !("wakeLock" in navigator)) {
      return false;
    }

    try {
      this.sentinel = await (navigator as any).wakeLock.request("screen");
      this.isActive = true;

      this.sentinel.addEventListener("release", () => {
        this.isActive = false;
      });

      // Automatically re-request lock if visibility returns
      document.addEventListener("visibilitychange", async () => {
        if (this.sentinel !== null && document.visibilityState === "visible") {
          await this.requestLock();
        }
      });

      return true;
    } catch (err) {
      console.warn("Screen Wake Lock could not be acquired:", err);
      this.isActive = false;
      return false;
    }
  }

  public async releaseLock(): Promise<void> {
    if (this.sentinel) {
      try {
        await this.sentinel.release();
        this.sentinel = null;
        this.isActive = false;
      } catch {}
    }
  }

  public getStatus(): { supported: boolean; active: boolean } {
    return {
      supported: typeof window !== "undefined" && "wakeLock" in navigator,
      active: this.isActive,
    };
  }
}

export const wakeLockManager = new WakeLockManager();
