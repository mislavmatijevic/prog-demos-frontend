import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { editor, IKeyboardEvent } from 'monaco-editor';
import {
  DiffEditorModel,
  MonacoEditorModule,
  NgxEditorModel,
} from 'ngx-monaco-editor-v2';
import { NewlinePipe } from '../../pipes/newline.pipe';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, NewlinePipe, MonacoEditorModule],
  providers: [NewlinePipe],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent implements OnInit, OnChanges {
  constructor(private newlinePipe: NewlinePipe) {}

  @Input() ngStyle: { [klass: string]: any } | null | undefined;
  @Input() isDiffEditor = false;
  @Output() onEditorReady = new EventEmitter();

  editor!: editor.ICodeEditor;
  diffEditor!: editor.IDiffEditor;
  editorModel: NgxEditorModel | null = null;
  initComplete = false;
  editorOptions: any;

  @Input() originalCode: string = '';
  @Input() comparedCode: string = '';
  @Output() comparedCodeChange = new EventEmitter<string>();
  diffOriginalModel!: DiffEditorModel;
  diffModifiedModel!: DiffEditorModel;

  @Input() code: string = '';
  @Output() codeChange = new EventEmitter<string>();

  @Input() bitCode: string = '';
  @Input() isBeingBitcoded: boolean = false;
  isActivelyHandlingBitcoding: boolean = false;

  ngOnInit(): void {
    this.setCodeEditorModel();

    if (!this.isDiffEditor) {
      this.editorOptions = {
        theme: 'prog-demos-theme',
        language: 'cpp',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        automaticLayout: true,
      };
    } else {
      this.diffOriginalModel = {
        code: this.newlinePipe.transform(this.originalCode),
        language: 'cpp',
      };
      this.diffModifiedModel = {
        code: this.newlinePipe.transform(this.comparedCode),
        language: 'cpp',
      };
      this.editorOptions = {
        theme: 'prog-demos-theme',
        language: 'cpp',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        readonly: true,
        automaticLayout: true,
      };
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['code'] !== undefined) {
      this.code = changes['code'].currentValue;
    }

    if (changes['isBeingBitcoded']) {
      this.handleStartBitcoding();
    }

    if (changes['bitCode'] && this.isActivelyHandlingBitcoding) {
      this.handleBitcoding();
    }
  }

  private handleStartBitcoding() {
    if (!this.isActivelyHandlingBitcoding && this.isBeingBitcoded) {
      this.isActivelyHandlingBitcoding = true;
      this.editorModel = {
        value: this.newlinePipe.transform(this.code),
        language: 'raw',
      };
    }

    if (this.isActivelyHandlingBitcoding && !this.isBeingBitcoded) {
      this.isActivelyHandlingBitcoding = false;
      this.setCodeEditorModel();
    }
  }

  onReady($event: any) {
    if (!this.initComplete) {
      fetch('assets/monaco-theme/prog-demos-theme.json')
        .then((data) => data.json())
        .then((data) => {
          if (!this.isDiffEditor) {
            $event._themeService.defineTheme('prog-demos-theme', data);
            $event._themeService.setTheme('prog-demos-theme');
          }
        });

      if (!this.isDiffEditor) {
        this.editor = $event;
      } else {
        this.diffEditor = $event;
      }

      this.onEditorReady.emit();

      if (this.isDiffEditor) {
        setTimeout(() => {
          this.diffEditor.goToDiff('next');
        }, 100);
      } else {
        this.enableEditorEvents();
      }
    }
  }

  private handleBitcoding() {
    if (this.isBeingBitcoded && this.editor !== undefined) {
      setTimeout(() => {
        this.editor.getModel()?.setValue(this.bitCode);
      });
    } else if (!this.isBeingBitcoded) {
      this.editor.getModel()?.dispose();
      this.setCodeEditorModel();
    }
  }

  private setCodeEditorModel() {
    this.editorModel = {
      value: this.newlinePipe.transform(this.code),
      language: 'cpp',
    };
  }

  private enableEditorEvents() {
    this.editor.onKeyDown((e: IKeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code == 'KeyS') {
        e.preventDefault();
      }
    });
    this.editor.onDidChangeModelContent((_: any) => {
      if (!this.isBeingBitcoded) {
        this.code = this.editor.getValue();
        this.codeChange.emit(this.code);
      }
    });
  }
}
