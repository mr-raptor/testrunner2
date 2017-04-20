import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class GridService {

	constructor(private http: Http) { }

	getGridNodes(): Promise<any[]> {
		return this.http.get("api/grid/nodes")
			.toPromise()
			.then(response => response.json() as any[])
			.catch(this.handleError);
	}

	startNode(node: string): Promise<any> {
		return this.http.get(`api/grid/${node}/start`)
			.toPromise()
			.then(response => response.json() as any)
			.catch(this.handleError);
	}

	stopNode(node: string): Promise<any> {
		return this.http.get(`api/grid/${node}/stop`)
			.toPromise()
			.then(response => response.json() as any)
			.catch(this.handleError);
	}

	restartNode(node: string): Promise<any> {
		return this.http.get(`api/grid/${node}/start?`)
			.toPromise()
			.then(response => response.json() as any)
			.catch(this.handleError);
	}

	restartGrid(): Promise<any> {
		return this.http.get(`api/grid/restart`)
			.toPromise()
			.then(response => response.json() as any)
			.catch(this.handleError);
	}
	
	private handleError(error: any): Promise<any> {
		console.error('An error!', error);
		return Promise.reject(error.message || error);
	}
}
