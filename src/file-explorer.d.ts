import {TAbstractFile, View, WorkspaceLeaf} from 'obsidian';

interface FileExplorerWorkspaceLeaf extends WorkspaceLeaf {
    containerEl: HTMLElement;
    view: FileExplorerView;
}

interface FileExplorerViewFileItem {
    selfEl: HTMLElement
    file: TAbstractFile
}

interface FileExplorerView extends View {
    fileItems: { [path: string]: FileExplorerViewFileItem };
}
