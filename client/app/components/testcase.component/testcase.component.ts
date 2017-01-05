import { Component, Input } from '@angular/core';

@Component({
	selector: '[testcase]',
	styles: [`
		.disabled {
			opacity: 0.1 !important
		}	
		.unchecked {
			opacity: 0.4
		}
		td.browser {
			width: 20px
		}
		td.title {
			width: 400px
		}
	`],
	template: `
		<td class="title">
			<input type="checkbox" [(ngModel)]="testcase.$['checked']" />
			{{testcase.$['methodname']}}
		</td>
		<td *ngFor="let test of testcase['test-case']" class="browser">
			<img src="/images/browsers/{{test.$.browser}}.png" 
				[class.unchecked]="!test.$['checked']"
				[class.disabled]="!testcase.$['checked']"
				(click)="toggleBrowser(test)" />
		</td>

	`
})
export class TestCaseComponent {
	@Input()
	testcase: any;
	browser: string;

	ngOnInit(): void {
		//console.log(this.testcase);
	}

	toggleBrowser(test:any): void {
		if(this.testcase.$['checked']) {
			test.$['checked'] = !test.$['checked'];
		}
	}
}
