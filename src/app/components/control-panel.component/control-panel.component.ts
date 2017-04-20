import { Component, Input } from '@angular/core';

import { Config } from '../../config';
import { ConfigService } from '../../services/config.service/config.service';
import { TreeService } from '../../services/tree.service/tree.service';

@Component({
	selector: 'control-panel',
	styles: [`
		aside {
			float: left;
			width: 10%;
			position: relative;
		}
	`],
	template: `
		<h3>Current config: {{config.name}}</h3>
		<small *ngIf="config.updated">Last updated: {{config.updated | date:'medium'}}</small>
		<p>
			<span>Selected tests:{{selectedCount()}}</span>
		</p>
		<br />
		<button (click)="runConfig()" class="btn btn-success">
			<span class="glyphicon glyphicon-play"></span>Run
		</button>
		<button (click)="saveConfig()" class="btn btn-primary">Save</button>		
		<button (click)="saveAs()" class="btn btn-primary">Save as ..</button>
		<br/>
		<status></status>
	`
})
export class ControlPanelComponent {
	@Input()
	config: Config;

	constructor(private configService: ConfigService,
				private treeService: TreeService) {}

	saveConfig(): void {
		this.configService.saveConfig(this.config);
	}

	runConfig(): void {
		this.configService.runConfig(this.config);
	}

	saveAs(): void {
		let name = prompt("Type new config name");
		if(!name || name === "")
			return;

		let newConfig = new Config();
		newConfig.name = name,
		newConfig.data = this.config.data;

		this.configService.saveConfig(newConfig);
	}

	selectedCount(): number {
		let count = 0;
		this.treeService.browse(this.config.data.testTree, {
			"TestCase": function(testcase:any) {
				if(testcase.$.checked)
					count++;
			}
		});
		return count;
	}
}