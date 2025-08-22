import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OV } from './ov';

describe('OV', () => {
  let component: OV;
  let fixture: ComponentFixture<OV>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OV]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OV);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
