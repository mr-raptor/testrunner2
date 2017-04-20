import { 
	Component, Input,
	trigger, state, animate, transition, style  
} from '@angular/core';

import { TreeService } from '../../services/tree.service/tree.service';

@Component({
	moduleId: module.id,
	selector: 'tree-view',
	styles: [`
		table {
		    border-collapse: collapse;
		    width: 100%;
		}
		td.browser {
			width: 20px
		}
		td.title {
			width: 400px
		}
		ul {
		    list-style-type: none;
		}
		
		li:hover {
			background-color: rgba(0,100,250,0.03);
		}
		.hide {
			display:none;
		}
		h4 {
			margin: 0;
		}
		.unchecked {
			opacity: 0.4
		}
	`],
	templateUrl: "tree-view.component.html",
	animations: [
		trigger('visibilityChanged', [
			state('shown', style({
				transform: 'display:block'
			})),
			state('hidden', style({
				transform: 'display:none'
			})),
			transition('shown => hidden', animate('400ms ease-in-out')),
			transition('hidden => shown', animate('400ms ease-in-out'))
		])
	]
})
export class TreeViewComponent {
	@Input()
	tree: any;
	@Input()
	browsers: any;

	isVisible = false;
	visibility = 'shown';	

	constructor(private treeService: TreeService) { }

	ngOnInit(): void {
		let visible = false;
		this.treeService.browse(this.tree, {
			"TestCase": function(testcase:any) {
				visible = visible || testcase.$.checked;
			}
		});
		this.isVisible = visible;

		this.browsers = JSON.parse(JSON.stringify(this.browsers));
	}

	toggleMenu(): void {
		this.isVisible = !this.isVisible;
		this.visibility = this.isVisible ? 'shown' : 'hidden';
	}

	toggleTree(): void {
		let checked = this.tree.$.checked = !this.tree.$.checked;
		this.treeService.browse(this.tree, {
			"TestCase": function(testcase:any) {
				testcase.$.checked = checked;
			}
		});
	}

	toggleBrowser(browser:any): void {
		browser.checked = !browser.checked;
		this.treeService.browse(this.tree, {
			"TestCase": function(testcase:any) {
				for(var test of testcase['test-case'].filter((test:any) => test.$.browser === browser.name)) {
					test.$.checked = browser.checked;
				}
			}
		});
	}
}