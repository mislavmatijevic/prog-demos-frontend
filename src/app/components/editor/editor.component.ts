import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { editor, IDisposable, IKeyboardEvent } from 'monaco-editor';
import {
  DiffEditorModel,
  MonacoEditorModule,
  NgxEditorModel,
} from 'ngx-monaco-editor-v2';
import { NewlinePipe } from '../../pipes/newline.pipe';

export type SyntaxError = {
  line: number;
  column: number;
  message: string;
};

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

  @ViewChild('errorExplanationPopup')
  errorExplanationPopup!: ElementRef<HTMLDivElement>;

  @Input() ngStyle: { [klass: string]: any } | null | undefined;
  @Input() isDiffEditor = false;
  @Output() onEditorReady = new EventEmitter();

  mainEditor!: editor.ICodeEditor;
  diffEditor!: editor.IDiffEditor;
  editorModel: NgxEditorModel | null = null;
  initComplete = false;
  editorOptions: any;

  decorations: Array<string> = [];

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

  @Input() syntaxErrors: Array<SyntaxError> = [];

  mouseMovementListener: IDisposable | null = null;

  ngOnInit(): void {
    this.editorOptions = {
      theme: 'prog-demos-theme',
      language: 'cpp',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      automaticLayout: true,
    };

    if (this.isDiffEditor) {
      this.diffOriginalModel = {
        code: this.newlinePipe.transform(this.originalCode),
        language: 'cpp',
      };
      this.diffModifiedModel = {
        code: this.newlinePipe.transform(this.comparedCode),
        language: 'cpp',
      };
    } else {
      this.setCodeEditorModel();
      this.editorOptions.model = this.editorModel;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['code'] !== undefined) {
      this.code = changes['code'].currentValue;
    }

    if (changes['isBeingBitcoded']) {
      this.handleBitcodingStateChange();
    }

    if (changes['bitCode'] && this.isActivelyHandlingBitcoding) {
      this.handleBitcoding();
    }

    if (changes['syntaxErrors']) {
      if (this.syntaxErrors.length > 0) {
        // This is not the best solution here for highlighting syntax errors.
        // The best solution would be calling the actual API for this: editor.setModelMarkers
        // However, the library I've used here (basically only viable solution for Angular) made that impossible.
        this.handleNewSyntaxErrors();
      }
    }
  }

  private handleNewSyntaxErrors() {
    setTimeout(() => {
      this.decorations = this.mainEditor.getModel()?.deltaDecorations(
        this.decorations,
        this.syntaxErrors.map((error) => {
          const { isWholeLine, problematicWord } =
            this.findWordCausingError(error);

          return {
            options: {
              className: 'editor__red-squiggle-lines',
              isWholeLine,
            },
            range: {
              startColumn: problematicWord?.startColumn ?? 0,
              endColumn: problematicWord?.endColumn ?? 0,
              startLineNumber: error.line,
              endLineNumber: error.line,
            },
          };
        })
      )!;

      this.mainEditor.setPosition({
        column: this.syntaxErrors[0].column,
        lineNumber: this.syntaxErrors[0].line,
      });

      this.mouseMovementListener = this.mainEditor.onMouseMove(
        this.debounceOnMouseMove((e: editor.IEditorMouseEvent) => {
          const el = this.errorExplanationPopup.nativeElement;

          const closestErrorFound = this.syntaxErrors.find((error) => {
            const { isWholeLine, problematicWord } =
              this.findWordCausingError(error);

            return (
              error.line == e.target.position?.lineNumber! &&
              (isWholeLine ||
                (problematicWord?.startColumn! <= e.target.position?.column! &&
                  problematicWord?.endColumn! >= e.target.position?.column!))
            );
          });

          if (closestErrorFound !== undefined) {
            el.style.visibility = 'visible';
            el.style.opacity = '100%';
            el.style.left = `${e.event.browserEvent.pageX}px`;
            el.style.top = `${e.event.browserEvent.pageY}px`;
            el.innerText = closestErrorFound?.message!;
          } else {
            el.style.opacity = '0%';
            setTimeout(() => (el.style.visibility = 'hidden'), 500);
          }
        }, 300)
      );
    }, 250);
  }

  private findWordCausingError(error: SyntaxError) {
    let problematicWord = this.mainEditor.getModel()?.getWordAtPosition({
      column: error.column,
      lineNumber: error.line,
    });
    let isWholeLine = false;

    if (problematicWord === null || problematicWord === undefined) {
      isWholeLine = true;
    }

    return { isWholeLine, problematicWord };
  }

  private handleBitcodingStateChange() {
    if (!this.isActivelyHandlingBitcoding && this.isBeingBitcoded) {
      this.isActivelyHandlingBitcoding = true;
      this.editorModel = {
        value: this.newlinePipe.transform(this.code),
        language: 'raw',
      };
    } else if (this.isActivelyHandlingBitcoding && !this.isBeingBitcoded) {
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
        this.mainEditor = $event;
      } else {
        this.diffEditor = $event;
        this.diffEditor.updateOptions({
          readOnly: true,
          readOnlyMessage: {
            value: 'Prouči ponuđenu pomoć!',
          },
        });
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
    if (this.isBeingBitcoded && this.mainEditor !== undefined) {
      this.mainEditor.updateOptions({
        readOnly: true,
        readOnlyMessage: {
          value: 'Strpi se, vratit ću ti kod!',
        },
      });
      this.mainEditor.getModel()?.setValue(this.bitCode);
    } else if (!this.isBeingBitcoded) {
      this.mainEditor.getModel()?.dispose();
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
    this.mainEditor.onKeyDown((e: IKeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code == 'KeyS') {
        e.preventDefault();
      }
    });
    this.mainEditor.onDidChangeModelContent((_: any) => {
      if (this.mouseMovementListener !== null) {
        const el = this.errorExplanationPopup.nativeElement;
        el.style.opacity = '0%';
        setTimeout(() => (el.style.visibility = 'hidden'), 500);
        this.mouseMovementListener.dispose();
        this.mouseMovementListener = null;
      }

      if (!this.isBeingBitcoded) {
        this.code = this.mainEditor.getValue();
        this.codeChange.emit(this.code);
        this.mainEditor.removeDecorations(this.decorations);
      }
    });
  }

  private debounceOnMouseMove(
    func: (arg: editor.IEditorMouseEvent) => void,
    wait: any
  ): (e: editor.IEditorMouseEvent) => void {
    let timeout: any;
    return function (this: void, arg: editor.IEditorMouseEvent) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(arg), wait);
    };
  }
}
