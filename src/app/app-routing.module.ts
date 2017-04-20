import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TestInfoComponent } from './components/test-info.component/test-info.component'
import { ConfigsComponent } from './components/configs.component/configs.component'
import { ResultsComponent } from './components/results.component/results.component';
import { GridComponent } from './components/grid/grid.component';

const routes: Routes = [
	{ path: '', redirectTo: 'configs', pathMatch: 'full' },
	{ path: 'configs', component: ConfigsComponent },
	{ path: 'testInfo/:id', component: TestInfoComponent },
	{ path: 'results', component: ResultsComponent },
	{ path: 'grid', component: GridComponent },
];

@NgModule({
	imports: [ RouterModule.forRoot(routes) ],
	exports: [ RouterModule ]
})
export class AppRoutingModule {}