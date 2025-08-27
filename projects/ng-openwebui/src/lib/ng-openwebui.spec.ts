import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgOpenwebUI } from './ng-openwebui';

describe('NgOpenwebUI', () => {
  let component: NgOpenwebUI;
  let fixture: ComponentFixture<NgOpenwebUI>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgOpenwebUI]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgOpenwebUI);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
