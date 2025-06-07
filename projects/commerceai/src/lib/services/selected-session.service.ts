// src/app/services/selected-session.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SelectedSessionService {
    private selectedSessionId = new BehaviorSubject<string | null>(null);
    selectedSessionId$ = this.selectedSessionId.asObservable();

    setSessionId(sessionId: string) {
        this.selectedSessionId.next(sessionId);
    }
}
