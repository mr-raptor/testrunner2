import { Component } from '@angular/core';

import { ResultsService } from '../../services/results.service/results.service';

@Component({
	selector: 'results',
	template: `
		<h2>Results:</h2>
		<ul *ngIf="results">
			<li *ngFor="let result of results">
				<a href="/results/page/{{result.folder}}">{{result.folder}}</a>
				{{result.status}}
			</li>
		</ul>
	`
})
export class ResultsComponent {
	results: any;

	constructor(private resultsService: ResultsService) {}

	ngOnInit(): void {
		this.resultsService.getResults().then(results => {
			this.results = results;
		});
	}
}