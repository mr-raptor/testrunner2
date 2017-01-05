import { Component, Input } from '@angular/core';

import { Config } from '../../config';

@Component({
	selector: 'host-template',
	styles: [`
		textarea {
			width: 400px;
			height: 100px;
		}
	`],
	template: `
		<div *ngIf="hostfile">
			<h3>Hosts file:</h3>
			<input type="checkbox" [(ngModel)]="hostfile.isActive" /><span>Replace host files on all nodes with that template:</span><br />
			<textarea [disabled]="!hostfile.isActive" [(ngModel)]="hostfile.template"></textarea>
		</div>
	`
})
export class HostTemplateComponent {
	@Input()
	hostfile: any;
}