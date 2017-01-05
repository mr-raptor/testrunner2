import { Component } from '@angular/core';

@Component({
	selector: 'my-app',
	styles: [`
		.header {
		    position: fixed;
			width: 100%;
			background-color: white;
			z-index: 2;
			margin-top: -130px;
		}

		.content {
			margin-top: 130px;
		}
	`],
	template: `
		<div class="header">
			<h1><a routerLink="/">TestRunner</a></h1>
			<nav>
				<a routerLink="configs">Configs</a>
				<a routerLink="results">Results</a>
			</nav>
		</div>

		<div class="content">
			<router-outlet></router-outlet>
		</div>
	`,
})
export class AppComponent { }