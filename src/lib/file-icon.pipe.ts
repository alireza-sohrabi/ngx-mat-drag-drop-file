import { Pipe, PipeTransform } from '@angular/core';
import * as fileIcon from "file-icons-js";

@Pipe({
  name: 'fileIcon'
})
export class FileIconPipe implements PipeTransform {

  transform(value: string, ...args: any[]): unknown {
    return this.getFileIcon(value);
  }
  getFileIcon(filename: string): string {
    if (!filename) {
      return "fal fa-file attachment-image__icon";
    }
    return fileIcon.getClass(filename) + " attachment-image__icon";
  }
}
