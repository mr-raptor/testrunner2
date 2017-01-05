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
		<aside>
			<h3>Current config: {{config.name}}</h3>
			<p>
				<span>Selected:{{selectedCount()}}</span>
			</p>
			<br />
			<button (click)="saveConfig()">Save</button>
			<button (click)="runConfig()">Run</button>
			<button (click)="saveAs()">Save as ..</button>
			<br/>
			<status></status>
		</aside>
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
		this.treeService.browse(this.config.data.testTree["test-suite"][0], {
			"TestCase": function(testcase:any) {
				if(testcase.$.checked)
					count++;
			}
		});
		return count;
	}
}