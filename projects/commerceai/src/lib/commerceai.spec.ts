import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Commerceai } from './commerceai';

describe('Commerceai', () => {
  let component: Commerceai;
  let fixture: ComponentFixture<Commerceai>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Commerceai]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Commerceai);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
