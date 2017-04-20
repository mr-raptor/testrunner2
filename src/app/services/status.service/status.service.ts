import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

//import 'rxjs/add/operator/toPromise';

@Injectable()
export class StatusService {
	private checkStatusUrl = "testInfo/checkStatus";

	constructor(private http: Http) {}


	status() {
		return Observable
			.interval(2000)
			.flatMap(() => {
				return this.http.get(this.checkStatusUrl)
					.map((r: Response) => r.text() as any);
			});
	}

	private handleError(error: any): Promise<any> {
		console.error('An error!', error);
		return Promise.reject(error.message || error);
	}
}