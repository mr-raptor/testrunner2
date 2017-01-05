import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from '../app-routing.module/app-routing.module';

import { AppComponent }  from '../../components/app.component/app.component';
import { TestInfoComponent } from '../../components/test-info.component/test-info.component';
import { TreeViewComponent } from '../../components/tree-view.component/tree-view.component';
import { FixtureComponent } from '../../components/fixture.component/fixture.component';
import { TestCaseComponent } from '../../components/testcase.component/testcase.component';
import { ConfigsComponent } from '../../components/configs.component/configs.component';
import { ConfigSettingsComponent } from '../../components/config-settings.component/config-settings.component';
import { ControlPanelComponent } from '../../components/control-panel.component/control-panel.component';
import { ResultsComponent } from '../../components/results.component/results.component';
import { StatusComponent } from '../../components/status.component/status.component';
import { HostTemplateComponent } from '../../components/host-template.component/host-template.component';

import { ConfigService } from '../../services/config.service/config.service';
import { ResultsService } from '../../services/results.service/results.service';
import { TreeService } from '../../services/tree.service/tree.service';
import { StatusService } from '../../services/status.service/status.service';

@NgModule({
	imports: [ 
		BrowserModule,
		FormsModule,
		HttpModule,
		AppRoutingModule
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
		HostTemplateComponent
	],
	providers: [ 
		ConfigService,
		ResultsService,
		TreeService,
		StatusService
	],
	bootstrap: [ AppComponent ]
})
export class AppModule { }
