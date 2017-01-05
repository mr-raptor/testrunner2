import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';
import { ChangeDetectorRef } from '@angular/core';

import { StatusService } from '../../services/status.service/status.service';

@Component({
	selector: 'status',
	styles: [`
	`],
	template: `
		<div>
			<span>
				Status: {{messages}}
			</span>
			<br />
		</div>
	`
})
export class StatusComponent implements OnInit {
	lastMessage: string = "";
	messages: Observable<any>;

	constructor(private statusService: StatusService, private cd: ChangeDetectorRef) {}

	ngOnInit(): void {
		this.statusService.status().subscribe(data => {
			this.messages = data;
			this.cd.markForCheck();
		})
	}

}