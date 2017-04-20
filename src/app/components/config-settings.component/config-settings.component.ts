import { Component, Input } from '@angular/core';

@Component({
	selector: 'config-settings',
	styles: [`
		.form-inline {
			margin: 5px;
		}
		
		.setting-item:hover .btn-delete {
			display: inline;
		}
		.btn-delete {
			display: none;
		}
	`],
	template: `
		<h3>App.config Settings:</h3>
		<div role="form" class="form-inline" *ngFor="let setting of settings">
			<div class="form-group setting-item">
				<label class="control-label">{{setting.name}}</label>
				<input class="form-control" [(ngModel)]="setting.value" />
				<button class="btn btn-danger btn-delete" (click)="deleteSetting(setting)">Delete</button>
			</div>
		</div>
		<div role="form" class="form-inline">
			<div class="form-group">
				<input class="form-control" [(ngModel)]="newSetting.name" placeholder="key" />
				<input class="form-control" [(ngModel)]="newSetting.value" placeholder="value" />
				<button class="btn btn-primary" (click)="addNew()">Add New</button>
			</div>		
		</div>
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

/*<ul *ngIf="settings">
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
</span>*/
