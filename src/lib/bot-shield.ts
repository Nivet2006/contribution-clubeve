/**
 * BotShield — Invisible 3-Layer Anti-Bot Protection
 *
 * Designed to block automated vote spam without any user-facing puzzles
 * or third-party services (no reCAPTCHA, no Turnstile, no hCaptcha).
 *
 * Layer 1: Honeypot Field — Hidden form field that bots auto-fill.
 * Layer 2: Minimum Time Threshold — Rejects submissions faster than 3 seconds.
 * Layer 3: Human Interaction Proof — Tracks mouse/touch/click events.
 */

export class BotShield {
  private pageLoadTime: number = 0;
  private interactionCount: number = 0;
  private honeypotValue: string = '';
  private listeners: Array<{ event: string; handler: () => void }> = [];

  /**
   * Initialize the bot shield. Call on component mount.
   * Starts tracking page load time and attaches interaction listeners.
   */
  init(): void {
    this.pageLoadTime = Date.now();
    this.interactionCount = 0;
    this.honeypotValue = '';

    if (typeof window === 'undefined') return;

    const incrementInteraction = () => {
      this.interactionCount++;
    };

    const events = ['mousemove', 'click', 'touchstart', 'keydown', 'scroll'];

    events.forEach((event) => {
      const handler = incrementInteraction;
      window.addEventListener(event, handler, { passive: true });
      this.listeners.push({ event, handler });
    });
  }

  /**
   * Set the honeypot field value from the hidden form input.
   */
  setHoneypotValue(value: string): void {
    this.honeypotValue = value;
  }

  /**
   * Get the current honeypot value.
   */
  getHoneypotValue(): string {
    return this.honeypotValue;
  }

  /**
   * Run all 3 validation layers.
   * Returns { passed: true } if the user appears human.
   * Returns { passed: false, reason: string } if bot behavior is detected.
   */
  validate(): { passed: boolean; reason?: string } {
    // Layer 1: Honeypot — if filled, it's a bot
    if (this.honeypotValue && this.honeypotValue.trim().length > 0) {
      return { passed: false, reason: 'honeypot_filled' };
    }

    // Layer 2: Time threshold — if less than 3 seconds, it's a bot
    const elapsed = Date.now() - this.pageLoadTime;
    const MIN_TIME_MS = 3000; // 3 seconds minimum
    if (elapsed < MIN_TIME_MS) {
      return { passed: false, reason: 'too_fast' };
    }

    // Layer 3: Interaction proof — if fewer than 3 interactions, suspicious
    const MIN_INTERACTIONS = 3;
    if (this.interactionCount < MIN_INTERACTIONS) {
      return { passed: false, reason: 'no_interaction' };
    }

    return { passed: true };
  }

  /**
   * Clean up event listeners. Call on component unmount.
   */
  destroy(): void {
    if (typeof window === 'undefined') return;

    this.listeners.forEach(({ event, handler }) => {
      window.removeEventListener(event, handler);
    });
    this.listeners = [];
  }
}
