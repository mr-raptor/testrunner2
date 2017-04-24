import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { AlertModule } from 'ng2-bootstrap';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent }  from './components/app.component/app.component';
import { TestInfoComponent } from './components/test-info.component/test-info.component';
import { TreeViewComponent } from './components/tree-view.component/tree-view.component';
import { FixtureComponent } from './components/fixture.component/fixture.component';
import { TestCaseComponent } from './components/testcase.component/testcase.component';
import { ConfigsComponent } from './components/configs.component/configs.component';
import { ConfigSettingsComponent } from './components/config-settings.component/config-settings.component';
import { ControlPanelComponent } from './components/control-panel.component/control-panel.component';
import { ResultsComponent } from './components/results.component/results.component';
import { StatusComponent } from './components/status.component/status.component';
import { HostTemplateComponent } from './components/host-template.component/host-template.component';
import { GridComponent } from './components/grid/grid.component';

import { ConfigService } from './services/config.service/config.service';
import { ResultsService } from './services/results.service/results.service';
import { TreeService } from './services/tree.service/tree.service';
import { StatusService } from './services/status.service/status.service';
import { GridService } from './services/grid.service';
import { GridNodeComponent } from './components/grid-node/grid-node.component';
import { ConfigSettingComponent } from './components/config-setting/config-setting.component';


@NgModule({
	imports: [ 
		BrowserModule,
		FormsModule,
		HttpModule,
		AppRoutingModule,
		AlertModule.forRoot()
	],
	declarations: [ 
		AppComponent,
		TestInfoComponent,
		TreeViewComponent,
		FixtureComponent,
		TestCaseComponent,
		ConfigsComponent,
		ConfigSettingsComponent,
		ControlPanelComponent,
		ResultsComponent,
		StatusComponent,
		HostTemplateComponent,
		GridComponent,
		GridNodeComponent,
		ConfigSettingComponent
	],
	providers: [ 
		ConfigService,
		ResultsService,
		TreeService,
		StatusService,
		GridService
	],
	bootstrap: [ AppComponent ]
})
export class AppModule { }
