import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class ResultsService {
	private resultsUrl = "api/results";

	constructor(private http: Http) {}

	getResults(): Promise<any[]> {
		return this.http.get(this.resultsUrl)
			.toPromise()
			.then(response => response.json() as any[])
			.catch(this.handleError);
	}

	private handleError(error: any): Promise<any> {
		console.error('An error!', error);
		return Promise.reject(error.message || error);
	}
}