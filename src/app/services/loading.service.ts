import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor() {}

  /**
   * Show the loading spinner
   */
  show(): void {
    this.loadingSubject.next(true);
  }

  /**
   * Hide the loading spinner
   */
  hide(): void {
    this.loadingSubject.next(false);
  }

  /**
   * Set the loading state to a specific value
   * @param state The loading state to set
   */
  setLoading(state: boolean): void {
    this.loadingSubject.next(state);
  }

  /**
   * Use this to wrap promises or observables with loading indicators
   * @param promise The promise to wrap with loading indicators
   * @returns The original promise
   */
  async withLoading<T>(promise: Promise<T>): Promise<T> {
    try {
      this.show();
      return await promise;
    } finally {
      this.hide();
    }
  }
} 