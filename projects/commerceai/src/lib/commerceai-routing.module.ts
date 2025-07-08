import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Commerceai } from './commerceai';

const routes: Routes = [
  { path: '', component: Commerceai }, // New chat
  { path: ':user_id', component: Commerceai },          // User chat without session
  { path: ':user_id/:session_id', component: Commerceai }, // Existing session
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommerceaiRoutingModule {}
