import { Notice } from 'obsidian';

export class LoadingToast {
    private notice: Notice | null = null;

    constructor() {}

    show(): void {
        // Hide any existing toast first
        this.hide();

        // Create simple persistent notice
        this.notice = new Notice('Generating title...', 0);
    }

    hide(): void {
        if (this.notice) {
            this.notice.hide();
            this.notice = null;
        }
    }
}