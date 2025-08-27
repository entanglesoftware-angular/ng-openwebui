import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgOpenwebui } from './ng-openwebui';

describe('NgOpenwebui', () => {
  let component: NgOpenwebui;
  let fixture: ComponentFixture<NgOpenwebui>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgOpenwebui]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgOpenwebui);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
