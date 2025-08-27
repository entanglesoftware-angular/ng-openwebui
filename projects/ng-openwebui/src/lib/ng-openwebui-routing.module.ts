import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgOpenwebui } from './ng-openwebui';

const routes: Routes = [
  { path: '', component: NgOpenwebui }, // New chat
  { path: ':user_id', component: NgOpenwebui },          // User chat without session
  { path: ':user_id/:session_id', component: NgOpenwebui }, // Existing session
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommerceaiRoutingModule {}
