import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlateTabsComponent } from './plate-tabs/plate-tabs.component';
import { MultiWellPlateComponent } from './multi-well-plate/multi-well-plate.component';

/**
 * We define two routes:
 *  - /manager    => shows the tab manager (PlateTabsComponent)
 *  - /plate      => shows only the multi well plate (MultiWellPlateComponent)
 *
 * The empty path '' redirects to '/manager' so that if you open
 * http://localhost:4200, you get the manager by default.
 */
const routes: Routes = [
  { path: 'manager', component: PlateTabsComponent },
  { path: 'plate', component: MultiWellPlateComponent },
  { path: '', redirectTo: 'manager', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
