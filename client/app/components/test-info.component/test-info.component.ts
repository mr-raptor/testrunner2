import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import 'rxjs/add/operator/switchMap';

import { Config } from '../../config';
import { ConfigService } from '../../services/config.service/config.service';
import { TreeService } from '../../services/tree.service/tree.service';

@Component({
	selector: 'test-info',
	styles: [`
		.container {
			width: 80%;
			float: left;
			overflow: hidden;
		    min-width: 800px;
    		padding-left: 50px;
		}
	`],
	template: `
		<div *ngIf="config">
			<control-panel [config]="config"></control-panel>
			<div class="container">
				<host-template [hostfile]="config.data.hostfile"></host-template>
				<config-settings [settings]="config.data.settings"></config-settings>
				<br />
				<tree-view [tree]='tree' [browsers]='browsers'></tree-view>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestInfoComponent {
	config: Config;
	tree: any;
	browsers: any;
	
	constructor(private configService: ConfigService,
				private treeService: TreeService,
				private route: ActivatedRoute,
				private location: Location,
				private cd: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.route.params
			.switchMap((params: Params) => this.configService.getConfig(params['id']))
			.subscribe(config => {
				this.config = config;
				this.tree = this.config.data.testTree["test-suite"][0];

				if(!this.config.data.settings)
					this.config.data.settings = [];
				if(!this.config.data.hostfile)
					this.config.data.hostfile = {
						isActive: false,
						template: ""
					}

				this.browsers = this.getBrowsers(this.tree)
				this.cd.markForCheck();
			});
	}

	getBrowsers(tree:any): any {
		let browsers = {};
		this.treeService.browse(tree, {
			"TestCase": function(testcase:any) {
				if(testcase['test-case']){
					for(var test of testcase['test-case']) {
						browsers[test.$.browser] = 1;
					}
				}
			}
		});
		return Object.keys(browsers).filter(key => key !== "error").map(key => {
			return {
				name: key,
				checked: false
			}
		});
	}
}