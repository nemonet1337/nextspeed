import { ipcMain, dialog } from 'electron';
import * as fs from 'fs/promises';

export function registerFileHandlers() {
    // ファイル保存ダイアログを開いて保存
    ipcMain.handle('file:save', async (event, data: string, defaultPath?: string) => {
        const { canceled, filePath } = await dialog.showSaveDialog({
            title: 'チューニングデータを保存',
            defaultPath: defaultPath || 'tune.json',
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (canceled || !filePath) return false;

        try {
            await fs.writeFile(filePath, data, 'utf-8');
            return true;
        } catch (e) {
            console.error('Failed to save file:', e);
            throw e;
        }
    });

    // ファイルを開くダイアログを表示して読み込み
    ipcMain.handle('file:open', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            title: 'チューニングデータを読み込み',
            properties: ['openFile'],
            filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (canceled || filePaths.length === 0) return null;

        try {
            const content = await fs.readFile(filePaths[0], 'utf-8');
            return content;
        } catch (e) {
            console.error('Failed to read file:', e);
            throw e;
        }
    });
}
