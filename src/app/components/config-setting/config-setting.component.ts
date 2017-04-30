import { Component, Input } from '@angular/core';

@Component({
  selector: 'config-setting',
  template: `
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
	`,
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
	`]
})
export class ConfigSettingComponent {
	@Input()
	settings: Setting[];
	newSetting = new Setting();

	addNew(): void {
		let trimmedSetting = new Setting();
		trimmedSetting = {
			name: this.newSetting.name.trim(),
			value: this.newSetting.value.trim()
		};
		this.settings.push(trimmedSetting);
		this.newSetting = new Setting();
	}

	deleteSetting(setting: any): void {
		let index = this.settings.indexOf(setting);
		if(index !== -1) {
			this.settings.splice(index, 1);
		}
	}

}

export class Setting {
	name: string;
	value: string;
}