import { Component } from '@angular/core';

@Component({
	selector: 'app-root',
	styles: [`
		.content {
			padding-top: 50px;
		}
	`],
	template: `
		<nav class="navbar navbar-default navbar-fixed-top">
			<div class="navbar-header">
				<b><i><a class="navbar-brand" routerLink="/">TestRunner</a></i></b>
			</div>
			<ul class="nav navbar-nav">
				<li><a routerLink="configs">Configs</a></li>
				<li><a routerLink="grid">Grid</a></li>
				<li><a routerLink="results">Results</a></li>
			</ul>
		</nav>
			
		<div class="content">
			<router-outlet></router-outlet>
		</div>
	`,
})
export class AppComponent { }