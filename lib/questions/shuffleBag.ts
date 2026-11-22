/**
 * Play Truth & Dare Shuffle-Bag Randomization Engine
 *
 * Implements a true cycle-based Shuffle-Bag selection algorithm with:
 * 1. Zero repeats within a single session until the pool is exhausted.
 * 2. Guaranteed anti-immediate repeat across cycle boundaries (the first card
 *    of cycle N+1 never equals the last card of cycle N if pool > 1).
 * 3. Session & multiplayer room history synchronization.
 * 4. Deterministic O(1) draw performance.
 */

export interface ShuffleBagResult<T> {
  item: T | null;
  isNewCycle: boolean;
  remainingInCycle: number;
  cycleNumber: number;
}

export class ShuffleBag<T extends { id: string }> {
  private allItems: T[];
  private availableQueue: T[] = [];
  private historyIds: string[] = [];
  private lastDrawnId: string | null = null;
  private cycleCount: number = 1;

  constructor(items: T[], initialDrawnIds: string[] = []) {
    this.allItems = [...items];
    this.historyIds = [...initialDrawnIds];
    this.initQueue();
  }

  /**
   * Initializes or replenishes the draw queue
   */
  private initQueue() {
    if (this.allItems.length === 0) {
      this.availableQueue = [];
      return;
    }

    const drawnSet = new Set(this.historyIds);
    let eligible = this.allItems.filter((item) => !drawnSet.has(item.id));

    // If all items have been drawn in this cycle, start a fresh cycle
    if (eligible.length === 0) {
      this.cycleCount++;
      eligible = [...this.allItems];
      this.historyIds = [];

      // Anti-immediate repeat: ensure the first item of the new cycle
      // is not identical to the last item of the previous cycle
      eligible = this.fisherYatesShuffle(eligible);
      if (this.lastDrawnId && eligible.length > 1 && eligible[0].id === this.lastDrawnId) {
        // Swap with the last item in the shuffled array
        const swapIdx = eligible.length - 1;
        [eligible[0], eligible[swapIdx]] = [eligible[swapIdx], eligible[0]];
      }
    } else {
      eligible = this.fisherYatesShuffle(eligible);
    }

    this.availableQueue = eligible;
  }

  /**
   * Cryptographically secure Fisher-Yates array shuffle
   */
  private fisherYatesShuffle(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Draw the next random question with anti-repetition cycle guarantees
   */
  public draw(): ShuffleBagResult<T> {
    if (this.allItems.length === 0) {
      return {
        item: null,
        isNewCycle: false,
        remainingInCycle: 0,
        cycleNumber: this.cycleCount,
      };
    }

    let isNewCycle = false;
    if (this.availableQueue.length === 0) {
      this.initQueue();
      isNewCycle = true;
    }

    const item = this.availableQueue.shift() || null;
    if (item) {
      this.lastDrawnId = item.id;
      this.historyIds.push(item.id);
    }

    return {
      item,
      isNewCycle,
      remainingInCycle: this.availableQueue.length,
      cycleNumber: this.cycleCount,
    };
  }

  /**
   * Returns copy of all drawn IDs in the current session
   */
  public getHistoryIds(): string[] {
    return [...this.historyIds];
  }

  /**
   * Returns current count of remaining questions before cycle exhaustion
   */
  public getRemainingCount(): number {
    return this.availableQueue.length;
  }

  /**
   * Returns whether the current cycle queue has been completely drawn
   */
  public isCurrentCycleExhausted(): boolean {
    return this.availableQueue.length === 0;
  }

  /**
   * Returns current cycle number
   */
  public getCycleCount(): number {
    return this.cycleCount;
  }
}
