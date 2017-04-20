import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GridNodeComponent } from './grid-node.component';

describe('GridNodeComponent', () => {
  let component: GridNodeComponent;
  let fixture: ComponentFixture<GridNodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GridNodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
