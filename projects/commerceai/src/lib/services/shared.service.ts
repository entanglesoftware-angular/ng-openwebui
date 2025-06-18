import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SharedService {
  private formSubmittedSource = new Subject<any>();
  formSubmitted$ = this.formSubmittedSource.asObservable();

  notifyFormSubmitted(data: any) {
    this.formSubmittedSource.next(data);
  }
}
