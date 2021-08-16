import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaPage } from './lista.page';

const routes: Routes = [
  {
    path: '',
    component: ListaPage
  },
  {
    path: 'detalle',
    loadChildren: () => import('./detalle/detalle.module').then( m => m.DetallePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaPageRoutingModule {}