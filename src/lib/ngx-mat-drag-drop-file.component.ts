import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  HostListener,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {v4 as uuid} from 'uuid';
import * as mime from 'mime';

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => NgxMatDragDropFileComponent),
  multi: true
};

@Component({
  selector: 'ngx-mat-drag-drop-file',
  templateUrl: './ngx-mat-drag-drop-file.component.html',
  styleUrls: ['./ngx-mat-drag-drop-file.component.scss'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR],
})
export class NgxMatDragDropFileComponent implements ControlValueAccessor {

  constructor() {
  }

  @Input() deleteFileLabel = 'Delete File';
  @Input() maximumFileLimitLabel = 'Maximum file upload limit is ';
  @Input() uploader: (formDate: FormData, tempId: string) => Promise<any>;
  @Input() maxFilePickCount = 6;
  @Input() addImageIcon: string = './assets/add-camera.png';
  maxFilePickCountError = false;
  errors: any[] = [];
  @Input() fileType: number | FileTypes;

  @HostBinding('class.disabled')
  @Input()
  get disabled() {
    return this._disabled;
  }

  set disabled(val: boolean) {
    this._disabled = coerceBooleanProperty(val);
  }

  @Input()
  set multiple(value: boolean) {
    this._multiple = coerceBooleanProperty(value);
  }

  get multiple() {
    return this._multiple;
  }

  @Input()
  set displayFileSize(value: boolean) {
    this._displayFileSize = coerceBooleanProperty(value);
  }

  get displayFileSize() {
    return this._displayFileSize;
  }

  @Input('activeBorderColor')
  @HostBinding('style.border-color')
  set borderColor(color: string) {
    this._activeBorderColor = color;
  }

  get borderColor() {
    return this.isDragover ? this._activeBorderColor : '#ccc';
  }

  get files() {
    return this._files;
  }

  @HostBinding('class.empty-input')
  get isEmpty() {
    return !this.files?.length;
  }


  // @HostBinding('class.drag-over')
  get isDragover() {
    return this._isDragOver;
  }

  set isDragover(value: boolean) {
    if (!this.disabled) {
      this._isDragOver = value;
    }
  }

  @Output()
  private valueChanged = new EventEmitter<NgxMatDragDropFileDto[]>();


  @ViewChild('fileInputEl')
  private fileInputEl: ElementRef;


  // does no validation, just sets the hidden file input
  @Input() accept = 'image/*';

  private _disabled = false;

  _multiple = false;

  @Input() emptyPlaceholder = `Drop file${this.multiple ? 's' : ''} or click to select`;

  private _displayFileSize = false;


  private _activeBorderColor = 'purple';


  private _files: File[] = [];
  private _isDragOver = false;

  // https://angular.io/api/forms/ControlValueAccessor
  private _onChange = (val: NgxMatDragDropFileDto[]) => {
  };
  private _onTouched = () => {
  };

  writeValue(files: File[]): void {
    const fileArray = this.convertToArray(files);
    if (fileArray.length < 2 || this.multiple) {
      this._files = fileArray;
      this.emitChanges(this._files);
    } else {
      throw Error('Multiple files not allowed');
    }

  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private emitChanges(files: File[]) {
    const filesS = files.map(r => {
      let avatar: NgxMatDragDropFileDto = {
        fileContentType: r.type || r['mimeType'],
        fileName: r.name,
        fileSize: r.size,
        tempId: r['tempId'],
        id: r['id'],
        status: r['status'],
        type: this.fileType
      };
      return avatar;
    });
    this.valueChanged.emit(filesS);
    this._onChange(filesS);
  }

  addFiles(files: File[] | FileList | File) {

    // this._onTouched();

    const fileArray = this.convertToArray(files);

    if (this.multiple) {
      // this.errorOnEqualFilenames(fileArray);
      const merged = this.files.concat(fileArray);
      this.writeValue(merged);
    } else {
      this.writeValue(fileArray);
    }


  }


  removeFile(file: File) {
    const fileIndex = this.files.indexOf(file);
    if (fileIndex >= 0) {
      const currentFiles = this.files.slice();
      currentFiles.splice(fileIndex, 1);
      this.writeValue(currentFiles);
    }
  }

  clear() {
    this.writeValue([]);
  }

  @HostListener('change', ['$event'])
  change(event: Event) {
    event.stopPropagation();
    this._onTouched();
    const fileList: FileList = (event.target as HTMLInputElement).files;
    this.removeDirectories(fileList).then((files: File[]) => {
      if (files?.length) {
        this.addFiles(files);
      }
    });
    // clear it so change is triggered if same file is selected again
    (event.target as HTMLInputElement).value = '';
  }

  @HostListener('dragenter', ['$event'])
  @HostListener('dragover', ['$event'])
  activate(e) {
    e.preventDefault();
    this.isDragover = true;
  }

  @HostListener('dragleave', ['$event'])
  deactivate(e) {
    e.preventDefault();
    this.isDragover = false;
  }

  @HostListener('drop', ['$event'])
  handleDrop(e) {
    this.deactivate(e);
    if (!this.disabled) {
      const fileList = e.dataTransfer.files;
      this.removeDirectories(fileList).then((files: File[]) => {
        if (files?.length) {
          this.addFiles(files);
        }
        this._onTouched();
      });
    }
  }

  // @HostListener('click')
  open() {
    if (!this.disabled) {
      this.fileInputEl?.nativeElement.click();
    }
  }


  // @HostListener('focusout')
  // blur() {
  //   console.log('blurred')
  //   this._onTouched();
  // }

  // private errorOnEqualFilenames(files: File[]) {
  //   if (this.files.some(file => files.some(file2 => file.name === file2.name))) {
  //     throw Error('one of the provided filenames already exists')
  //   }

  //   for (let i = 0; i < files.length; i++) {
  //     for (let j = i + 1; j < files.length; j++) {
  //       if (files[i].name === files[j].name) {
  //         throw Error(`can't add multiple files with same name`)
  //       }
  //     }
  //   }
  // }

  private removeDirectories(files: FileList): Promise<any> {

    return new Promise((resolve, reject) => {
      this.maxFilePickCountError = false;

      let fileArray = this.convertToArray(files);

      const uploadedFiles = this.files.filter(z => z['status'] !== 'error');
      const uploadedFilesLength = uploadedFiles.length;
      const fileTotalCount = uploadedFilesLength + fileArray.length;
      if (fileTotalCount > this.maxFilePickCount) {
        this.maxFilePickCountError = true;

        if (uploadedFilesLength < this.maxFilePickCount) {
          fileArray = fileArray.slice(0, this.maxFilePickCount - uploadedFilesLength);
        } else {
          return;
        }
      }


      if (fileArray.length)
        // add tempId into files
      {
        fileArray.forEach(item => item['tempId'] = uuid());
      }

      const dirnames = [];

      const readerList = [];

      for (let i = 0; i < fileArray.length; i++) {

        const file = fileArray[i];

        const reader = new FileReader();


        reader.onerror = () => {
          dirnames.push(fileArray[i].name);
        };
        let thumbnailAble = false;
        let mimeType = file.type;
        file['message'] = 10;
        if (!file.type) {
          mimeType = mime.getType(this.getLasIndexType(file.name));
          file['mimeType'] = mimeType;
        }

        if (mimeType.includes('image') || mimeType.includes('video')) {
          thumbnailAble = true;
        }

        reader.onloadend = () => {

          readerList.push(i);
          if (this.uploader && typeof (this.uploader) === 'function') {
            const formData = new FormData();
            const blob = file.slice(0, file.size, mimeType);
            const newFile = new File([blob], `temp_${file['tempId']}`, {type: mimeType});
            formData.append('file', newFile);

            this.uploader(formData, file['tempId']).then((res) => {
              if (res && res.message) {
                file['message'] = res?.message;
              } else {
                file['message'] = 1;
              }
              if (file['message'] && file['message'] == 100) {
                file['status'] = 'complete';
              }
            }).catch(err => {
              file['status'] = 'error';
              file['message'] = err?.error;
              if (!this.errors) {
                this.errors = [];
              }
              this.errors.push({message: file['message'], name: file.name});
              const fileDeleteIndex = this.files.findIndex(z => z['tempId'] === file['tempId']);
              if (fileDeleteIndex !== -1) {
                this.files.splice(fileDeleteIndex, 1);
                const ff = this.files.slice();
                this.emitChanges(ff);
              }

            });
          }
          if (readerList.length === fileArray.length) {
            resolve(fileArray.filter((file: File) => !dirnames.includes(file.name)));
          }

          if (thumbnailAble) {
            file['imageUrl'] = reader.result;
          }

        };
        if (thumbnailAble) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      }


    });


  }

  private getLasIndexType(fileName: string): string {
    try {
      return fileName.substr(
        fileName.lastIndexOf('.') + 1,
        fileName.length - fileName.lastIndexOf('.')
      );
    } catch (error) {
      return '';
    }
  }

  private convertToArray(files: FileList | File[] | File | null | undefined): File[] {
    if (files) {
      if (files instanceof File) {
        return [files];
      } else if (Array.isArray(files)) {
        return files;
      } else {
        return Array.prototype.slice.call(files);
      }
    }
    return [];
  }

}

export class NgxMatDragDropFileDto {
  id: any;
  fileName: string;
  fileSize: number;
  fileContentType: string;
  type?: number | FileTypes;
  tempId: string;
  addresses?: string[] = [];
  imageUrl?: string;
  status?: string;
}

export enum FileTypes {
  User,
}
