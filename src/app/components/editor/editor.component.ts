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
import { IKeyboardEvent } from 'monaco-editor';
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

  editor: any;

  @Input() originalCode: string = '';
  @Input() comparedCode: string = '';
  @Output() comparedCodeChange = new EventEmitter<string>();
  diffOriginalModel!: DiffEditorModel;
  diffModifiedModel!: DiffEditorModel;

  editorModel: NgxEditorModel | null = null;

  @Input() code: string = '';
  @Output() codeChange = new EventEmitter<string>();

  ngOnInit(): void {
    this.editorModel = {
      value: this.newlinePipe.transform(this.code),
      language: 'cpp',
    };

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

      console.log(this.originalCode);
      console.log(this.comparedCode);

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
  }

  initComplete = false;

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
      this.editor = $event;
      this.onEditorReady.emit();

      if (this.isDiffEditor) {
        setTimeout(() => {
          this.editor.goToDiff();
        }, 100);
      } else {
        this.enableEditorEvents();
      }
    }
  }

  editorOptions: any;

  private enableEditorEvents() {
    this.editor.onKeyDown((e: IKeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code == 'KeyS') {
        e.preventDefault();
      }
    });
    this.editor.onDidChangeModelContent((_: any) => {
      this.code = this.editor.getValue();
      this.codeChange.emit(this.code);
    });
  }
}
