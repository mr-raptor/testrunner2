import { Component, OnInit, Input } from '@angular/core';

import { GridService } from '../../services/grid.service'

@Component({
  selector: 'grid-node',
  templateUrl: './grid-node.component.html',
  styleUrls: ['./grid-node.component.css']
})
export class GridNodeComponent implements OnInit {
	@Input()
	node: any;

	constructor(private gridService:GridService) { }

	ngOnInit() {
	}

	start(): void {
		this.gridService.startNode(this.node.name)
			.then((status) => { this.node = status });
	}

	stop(): void {
		this.gridService.stopNode(this.node.name)
			.then((status) => { this.node = status });
	}

	restart(): void {
		this.gridService.stopNode(this.node.name)
			.then(() => this.gridService.startNode(this.node.name))
			.then((status) => { this.node = status });
	}
}
