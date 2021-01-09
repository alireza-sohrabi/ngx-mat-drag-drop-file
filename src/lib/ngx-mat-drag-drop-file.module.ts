import {NgModule} from '@angular/core';
import {NgxMatDragDropFileComponent} from './ngx-mat-drag-drop-file.component';
import {CommonModule} from "@angular/common";
import {MatChipsModule} from "@angular/material/chips";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatBadgeModule} from "@angular/material/badge";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {FileIconPipe} from "./file-icon.pipe";
import {BytePipe} from "./byte.pipe";


@NgModule({
  declarations: [NgxMatDragDropFileComponent, FileIconPipe, BytePipe
  ],
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatProgressBarModule,
  ],
  exports: [NgxMatDragDropFileComponent]
})
export class NgxMatDragDropFileModule {
}
