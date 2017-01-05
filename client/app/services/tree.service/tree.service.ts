import { Injectable } from '@angular/core';

@Injectable()
export class TreeService {
	browse(testTree:any, actions:any) {
		if(!testTree)
			return;

		if(testTree.$ && testTree.$.type && actions[testTree.$.type])
			actions[testTree.$.type](testTree);	

		if(testTree["test-suite"])
			for(var subTree of testTree["test-suite"])
				this.browse(subTree, actions);
	}
}