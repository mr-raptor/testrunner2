import { Component } from '@angular/core';

import { ResultsService } from '../../services/results.service/results.service';

@Component({
	selector: 'results',
	template: `
		<h3>Results:</h3>
		
		<table *ngIf="results" class="table table-striped">
			<tr>
				<th>
					Report
				</th>
				<th>
					Status
				</th>
			</tr>
			<tr *ngFor="let result of results">
				<td>
					<a href="/results/page/{{result.folder}}">{{result.folder}}</a>
				</td>
				<td>
					{{result.status}}
				</td>
			</tr>
		</table>
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