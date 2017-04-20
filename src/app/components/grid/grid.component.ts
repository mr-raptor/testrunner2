import { Component, OnInit } from '@angular/core';

import { GridService } from '../../services/grid.service'

@Component({
  selector: 'grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit {
	nodes: any[];

	constructor(private gridService: GridService) { }

	ngOnInit() {
		this.gridService.getGridNodes()
			.then((nodes) => this.nodes = nodes);
	}

	restartAll() {
		this.nodes.forEach((node) => {
			this.gridService.restartNode(node)
				.then((status) => { node = status });
		});
	}

	restartGrid() {
		this.gridService.restartGrid()
			.then((status) => { console.log(status); });
	}
}