import { Component, Input } from '@angular/core';

@Component({
	selector: 'fixture',
	styles: [`
		table {
		    border-collapse: collapse;
		    width: 100%;
		}
		table, th, td {
		    //border: 1px solid black;
		}
		
		tr:hover {
			background-color: rgba(0,100,250,0.03);
		}
	`],
	template: `
		<table>
			<tr *ngFor="let testcase of fixture['test-suite']" testcase [testcase]="testcase"></tr>
		</table>
	`
})
export class FixtureComponent {
	@Input()
	fixture: any;
}