import { Component,Input,Output,EventEmitter } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'lib-header',
  imports: [MatToolbar,MatIcon,MatMenuModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
 @Input() aiName: string = '';

 modelMap: { model: string; domain: string }[] = [];
  selectedModel: string = '';
  selectedDomain: string = '';
  dropdownOpen: boolean = false;
  rofileDropdownOpen: boolean = false;
  domain: string = '';
  userInitial: string = '';



toggleDropdown(){
  
}

goToSettings(){

}
selectModel(model: string) {
    this.selectedModel = model;
    const found = this.modelMap.find((m) => m.model === model);
    this.selectedDomain = found?.domain || '';
    this.dropdownOpen = false;
  }
  @Output() menuClicked = new EventEmitter<void>();

onMenuClick() {
  this.menuClicked.emit();
}

}
