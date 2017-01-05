import { Component, Input } from '@angular/core';

@Component({
	selector: 'config-settings',
	template: `
		<h3>App.config Settings:</h3>
		<ul *ngIf="settings">
			<li *ngFor="let setting of settings">
				<span>
					{{setting.name}}
					<input type="text" [(ngModel)]="setting.value" />
					<button (click)="deleteSetting(setting)">Delete</button>
				</span>
			</li>
		</ul>
		<span>
			<input type="text" [(ngModel)]="newSetting.name" />
			<input type="text" [(ngModel)]="newSetting.value" />
			<button (click)="addNew()">Add New</button>
		</span>
	`
})
export class ConfigSettingsComponent {
	@Input()
	settings: any;
	newSetting = {};

	addNew(): void {
		this.settings.push(this.newSetting);
		this.newSetting = {};
	}

	deleteSetting(setting: any): void {
		let index = this.settings.indexOf(setting);
		if(index !== -1) {
			this.settings.splice(index, 1);
		}
	}
	
}