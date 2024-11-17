import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { HelpStep } from '../../types/models';
import { ApiService } from './api.service';

export type HelpStepResponse = {
  success: boolean;
  helpStep: HelpStep;
};

type HelpStepIdentifier = {
  taskId: number;
  helpStepIndex: number;
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

  findHelpStep(identifier: HelpStepIdentifier): HelpStep | undefined {
    return this.storedHelpSteps.get(this.getUniqueHelpStepKey(identifier));
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
}
