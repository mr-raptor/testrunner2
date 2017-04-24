import { Component, Input } from '@angular/core';

@Component({
	selector: 'config-settings',
	styles: [``],
	template: `
		<div *ngIf="settings">
			<div *ngFor="let settingName of keys">
				<h3>{{settingName}} Settings:</h3>
				<config-setting [settings]="settings[settingName]"></config-setting>
			</div>
		</div>
	`
})
export class ConfigSettingsComponent {
	@Input()
	settings: any;
	
	keys: string[];
	
	ngOnInit(): void {
		this.keys = Object.keys(this.settings);
	}
	
}

