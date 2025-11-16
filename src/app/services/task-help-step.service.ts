import { Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { HelpStep } from '../../types/models';
import { ApiService } from './api.service';

export type HelpStepResponse = {
  success: boolean;
  helpStep: HelpStep;
};

export type HelpStepCountResponse = {
  success: boolean;
  helpSteps: number;
};

type HelpStepIdentifier = {
  taskId: number;
  helpStepIndex: number;
};

export type AvailableHelpSteps = {
  step: number;
  dateMadeAvailable: Date;
};

export type AvailableHelpStepsResponse = {
  success: boolean;
  availableHelpSteps: Array<AvailableHelpSteps>;
};

@Injectable({
  providedIn: 'root',
})
export class TaskHelpStepService {
  constructor(private apiService: ApiService) {}
  private storedHelpSteps: Map<string, HelpStep> = new Map();

  getHelpStep(
    taskId: number,
    helpStepIndex: number
  ): Observable<HelpStepResponse> {
    if (helpStepIndex < 1) {
      throw new Error('Steps have indices starting from 1!');
    }

    const storedHelpStep = this.findHelpStep({ taskId, helpStepIndex });

    if (storedHelpStep !== undefined) {
      return of({ success: storedHelpStep != null, helpStep: storedHelpStep });
    } else {
      return this.apiService
        .get<HelpStepResponse>(`/tasks/${taskId}/help/${helpStepIndex}`)
        .pipe(
          tap({
            next: (response) => {
              this.storeHelpStep(taskId, response.helpStep);
            },
          })
        );
    }
  }

  getHelpStepCount(taskId: number): Observable<number> {
    return this.apiService
      .get<HelpStepCountResponse>(`/tasks/${taskId}/help`)
      .pipe(map((value: HelpStepCountResponse) => value.helpSteps));
  }

  getLatestAvailableHelpStep(taskId: number): Observable<number> {
    return this.apiService
      .get<AvailableHelpStepsResponse>(`/tasks/${taskId}/help/available`, true)
      .pipe(
        map(
          (value: AvailableHelpStepsResponse) =>
            value.availableHelpSteps.sort(
              (step1, step2) => step2.step - step1.step
            )[0].step
        )
      );
  }

  makeHelpStepAvailable(taskId: number, helpStepIndex: number) {
    this.apiService
      .post(`/tasks/${taskId}/help/${helpStepIndex}/available`, null, true)
      .subscribe();
  }

  findHelpStep(identifier: HelpStepIdentifier): HelpStep | undefined {
    const helpStepKey = this.getUniqueHelpStepKey(identifier);
    let locallySavedHelpStep = this.storedHelpSteps.get(helpStepKey);

    if (locallySavedHelpStep === undefined) {
      const helpStepFromLocalStorage = localStorage.getItem(helpStepKey);
      if (helpStepFromLocalStorage != null)
        try {
          locallySavedHelpStep =
            JSON.parse(helpStepFromLocalStorage) ?? undefined;
        } catch {
          localStorage.removeItem(helpStepKey);
        }
    }

    return locallySavedHelpStep;
  }

  getAllStoredHelpSteps(): Array<HelpStep> {
    const allStoredSteps: Array<HelpStep> = [];
    this.storedHelpSteps.forEach((value) => {
      allStoredSteps.push(value);
    });
    return allStoredSteps;
  }

  private storeHelpStep(taskId: number, helpStep: HelpStep) {
    const uniqueHelpStepKey = this.getUniqueHelpStepKey({
      taskId,
      helpStepIndex: helpStep.step,
    });
    this.storedHelpSteps.set(uniqueHelpStepKey, helpStep);
  }

  private getUniqueHelpStepKey(identifier: HelpStepIdentifier) {
    return `${identifier.taskId}/${identifier.helpStepIndex}`;
  }

  persistHelpSteps(): void {
    this.storedHelpSteps.forEach((value, key) =>
      localStorage.setItem(key, JSON.stringify(value))
    );
  }
}
