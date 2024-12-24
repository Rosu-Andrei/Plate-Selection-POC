import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlateTabsComponent } from './plate-tabs.component';

describe('PlateTabsComponent', () => {
  let component: PlateTabsComponent;
  let fixture: ComponentFixture<PlateTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlateTabsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlateTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
