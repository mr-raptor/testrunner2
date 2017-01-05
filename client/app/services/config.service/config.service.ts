import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Config } from '../../config';

@Injectable()
export class ConfigService {
	private configsUrl = 'api/configs';
	private configUrl = 'api/config';
	
	constructor(private http: Http) {}

	getConfigs(): Promise<Config[]> {
		return this.http.get(this.configsUrl)
			.toPromise()
			.then(response => response.json() as Config[])
			.catch(this.handleError);
	}
	
	getConfig(name: string): Promise<Config> {
		return this.http.get(this.configUrl+'/'+name)
			.toPromise()
			.then(response => response.json() as Config)
			.catch(this.handleError);
	}

	addConfig(config: Config): Promise<Config[]> {
		return this.http.post(this.configUrl, config)
			.toPromise()
			.then(response => response.json() as Config[])
			.catch(this.handleError);
	}

	saveConfig(config: Config): any {
		if(config && config.name && config.data) {
			return this.http.post(this.configUrl+'/'+config.name, config)
				.toPromise()
				.then(response => console.dir(response))
				.catch(this.handleError);
		}
	}

	runConfig(config: Config): any {
		return this.http.post(this.configUrl+'/run/'+config.name, config)
			.toPromise()
			.then(response => console.dir(response))
			.catch(this.handleError);
	}

	deleteConfig(config: Config): Promise<Config[]> {
		return this.http.delete(this.configUrl+'/'+config.name)
			.toPromise()
			.then(response => response.json() as Config[])
			.catch(this.handleError);
	}

	private handleError(error: any): Promise<any> {
		console.error('An error!', error);
		return Promise.reject(error.message || error);
	}
}