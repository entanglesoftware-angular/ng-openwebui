// // src/app/services/selected-session.service.ts
// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Subject } from 'rxjs';
//
// @Injectable({
//     providedIn: 'root',
// })
// export class SelectedSessionService {
//     private selectedSessionId = new BehaviorSubject<string | null>(null);
//     selectedSessionId$ = this.selectedSessionId.asObservable();
//     private newSessionCreatedSource = new Subject<void>(); // New subject for session creation
//     newSessionCreated$ = this.newSessionCreatedSource.asObservable();
//     setSessionId(sessionId: string | null) {
//         this.selectedSessionId.next(sessionId);
//     }
//
//     notifyNewSessionCreated() {
//       this.newSessionCreatedSource.next();
//     }
// }
