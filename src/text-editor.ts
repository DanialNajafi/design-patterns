// src/text-editor.ts

// 1) State-Interface
export interface EditorState {
  save(editor: TextEditor): void;
  saveAs(editor: TextEditor): void;
  edit(editor: TextEditor, newText: string): void;
  newFile(editor: TextEditor): void;
  open(editor: TextEditor, filename: string, content: string): void;
  getLabel(editor: TextEditor): string;
}

// 2) TextEditor
export class TextEditor {
  private state: EditorState;
  private text: string = "";
  private filename: string | null = null;

  constructor(initialState: EditorState) {
    this.state = initialState;
  }

  setState(s: EditorState) {
    this.state = s;
    this.updateLabel();
  }

  getText() {
    return this.text;
  }

  setText(t: string) {
    this.text = t;
  }

  getFilename() {
    return this.filename;
  }

  setFilename(name: string | null) {
    this.filename = name;
  }

  // API für DOM
  edit(newText: string) {
    this.state.edit(this, newText);
  }

  save() {
    this.state.save(this);
  }

  saveAs() {
    this.state.saveAs(this);
  }

  newFile() {
    this.state.newFile(this);
  }

  open(filename: string, content: string) {
    this.state.open(this, filename, content);
  }

  getLabel() {
    return this.state.getLabel(this);
  }

  private updateLabel() {
    const lbl = document.getElementById("state-label")!;
    lbl.innerText = this.getLabel();
  }
}

// 3) Vier konkrete States
class CleanUnsaved implements EditorState {
  save(editor: TextEditor) {
    // Speichern wie Save As
    new DirtySaved().save(editor);
  }
  saveAs(editor: TextEditor) {
    const name = prompt("Enter a File Name", "")?.trim();
    if (!name) return;
    const fn = name.endsWith(".txt") ? name : name + ".txt";
    localStorage.setItem(fn, editor.getText());
    editor.setFilename(fn);
    editor.setState(new CleanSaved());
  }
  edit(editor: TextEditor, newText: string) {
    editor.setText(newText);
    editor.setState(new DirtyUnsaved());
  }
  newFile(editor: TextEditor) {
    editor.setText("");
    editor.setFilename(null);
    editor.setState(new CleanUnsaved());
  }
  open(editor: TextEditor, filename: string, content: string) {
    editor.setText(content);
    editor.setFilename(filename);
    editor.setState(new CleanSaved());
  }
  getLabel(editor: TextEditor) {
    return "_";
  }
}

class DirtyUnsaved implements EditorState {
  save(editor: TextEditor) {
    new DirtyUnsaved().saveAs(editor);
  }
  saveAs(editor: TextEditor) {
    const name = prompt("Enter a File Name", "")?.trim();
    if (!name) return;
    const fn = name.endsWith(".txt") ? name : name + ".txt";
    localStorage.setItem(fn, editor.getText());
    editor.setFilename(fn);
    editor.setState(new CleanSaved());
  }
  edit(editor: TextEditor, newText: string) {
    editor.setText(newText);
    // bleibt DirtyUnsaved
  }
  newFile(editor: TextEditor) {
    editor.setText("");
    editor.setFilename(null);
    editor.setState(new CleanUnsaved());
  }
  open(editor: TextEditor, filename: string, content: string) {
    editor.setText(content);
    editor.setFilename(filename);
    editor.setState(new CleanSaved());
  }
  getLabel(editor: TextEditor) {
    return "*";
  }
}

class CleanSaved implements EditorState {
  save(editor: TextEditor) {
    const fn = editor.getFilename()!;
    localStorage.setItem(fn, editor.getText());
    editor.setState(new CleanSaved()); // bleibt clean
  }
  saveAs(editor: TextEditor) {
    new CleanUnsaved().saveAs(editor);
  }
  edit(editor: TextEditor, newText: string) {
    editor.setText(newText);
    editor.setState(new DirtySaved());
  }
  newFile(editor: TextEditor) {
    editor.setText("");
    editor.setFilename(null);
    editor.setState(new CleanUnsaved());
  }
  open(editor: TextEditor, filename: string, content: string) {
    editor.setText(content);
    editor.setFilename(filename);
    editor.setState(new CleanSaved());
  }
  getLabel(editor: TextEditor) {
    return editor.getFilename()!;
  }
}

class DirtySaved implements EditorState {
  save(editor: TextEditor) {
    const fn = editor.getFilename()!;
    localStorage.setItem(fn, editor.getText());
    editor.setState(new CleanSaved());
  }
  saveAs(editor: TextEditor) {
    new DirtyUnsaved().saveAs(editor);
  }
  edit(editor: TextEditor, newText: string) {
    editor.setText(newText);
    // bleibt DirtySaved
  }
  newFile(editor: TextEditor) {
    editor.setText("");
    editor.setFilename(null);
    editor.setState(new CleanUnsaved());
  }
  open(editor: TextEditor, filename: string, content: string) {
    editor.setText(content);
    editor.setFilename(filename);
    editor.setState(new CleanSaved());
  }
  getLabel(editor: TextEditor) {
    return editor.getFilename()! + " *";
  }
}

// 4) DOM-Initialisierung (in index.ts oder am Ende von text-editor.ts)
window.addEventListener("DOMContentLoaded", () => {
  const editor = new TextEditor(new CleanUnsaved());
  const textArea = document.getElementById("text") as HTMLTextAreaElement;
  const btnSave = document.getElementById("save-button")!;
  const btnSaveAs = document.getElementById("save-as-button")!;
  const btnNew = document.getElementById("new-button")!;

  function refreshFileList() {
    const parent = document.getElementById("files-list")!;
    parent.innerHTML = "";
    const files = Array.from({ length: localStorage.length }, (_, i) =>
      localStorage.key(i)!
    );
    for (const f of files) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.innerText = f;
      a.addEventListener("click", () => {
        const content = localStorage.getItem(f)!;
        editor.open(f, content);
        textArea.value = content;
      });
      li.append(a);
      parent.append(li);
    }
  }

  // Event-Handler
  textArea.addEventListener("input", () => {
    editor.edit(textArea.value);
  });
  btnSave.addEventListener("click", () => {
    editor.save();
  });
  btnSaveAs.addEventListener("click", () => {
    editor.saveAs();
  });
  btnNew.addEventListener("click", () => {
    editor.newFile();
    textArea.value = "";
  });

  // Erst-Init
  editor["updateLabel"](); // initialen Label setzen
  refreshFileList();

  // Context-Menu-Ausbruch bleibt global
  document.addEventListener("contextmenu", (e) => {
    alert("Wanna steal my source code, huh!?");
    e.preventDefault();
  });

  // Nach jedem Save / SaveAs / New / Open: Files-Liste aktualisieren
  const observer = new MutationObserver(refreshFileList);
  observer.observe(
    document.getElementById("files-list")!,
    { childList: true }
  );
});
