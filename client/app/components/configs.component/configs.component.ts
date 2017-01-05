import { Component } from '@angular/core';

import { Config } from '../../config';
import { ConfigService } from '../../services/config.service/config.service';

@Component({
	selector: 'configs',
	styles: [`
		ul {
			width: 50%;
		}
		.delete_button {
			display: none;
			color: grey;
			float: right;
		}
		li:hover .delete_button {
			display: block;
		}
		li:hover {
			background-color: rgba(0,100,250,0.03);
		}
	`],
	template: `
		<h2>Select config:</h2>
		<ul>
			<li>
				<input type="text" [(ngModel)]="newConfig.name" />
				<input type="button" (click)="addConfig()" value="New" />
				<span id="error_msg"></span>
			</li>
			<li *ngFor="let config of configs">
				<a [routerLink]="['/testInfo',config.name]">{{config.name}}</a> 
				<a class="delete_button" (click)="deleteConfig(config)">Delete</a>
			</li>
		</ul>
	`
})
export class ConfigsComponent {
	configs: Config[] = [];
	newConfig = new Config();
	
	constructor(private configService: ConfigService) {}
	
	ngOnInit(): void {
		this.configService.getConfigs().then(configs => {
			this.configs = configs;
		});
	}

	addConfig(): void {
		this.configService.addConfig(this.newConfig)
			.then(configs => {
				this.configs = configs;
				this.newConfig = new Config();
			});
	}

	deleteConfig(config: Config): void {
		this.configService.deleteConfig(config)
			.then(configs => {
				this.configs = configs;
			});
	}
}