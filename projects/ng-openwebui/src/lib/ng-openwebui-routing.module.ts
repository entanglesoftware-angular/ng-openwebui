import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgOpenwebUI } from './ng-openwebui';

const routes: Routes = [
  { path: '', component: NgOpenwebUI }, // New chat
  { path: ':user_id', component: NgOpenwebUI },          // User chat without session
  { path: ':user_id/:session_id', component: NgOpenwebUI }, // Existing session
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NgOpenwebUIRoutingModule {}
