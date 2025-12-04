import { Injectable } from '@angular/core';

export interface Command {
  execute(): void;
  undo(): void;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommandInvokerService {
  private commandHistory: Command[] = [];
  private undoHistory: Command[] = [];
  private maxHistorySize = 50;

  executeCommand(command: Command): void {
    command.execute();
    this.commandHistory.push(command);
    
    // Limitar tamaño del historial
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory.shift();
    }
    
    // Limpiar historial de rehacer cuando se ejecuta un nuevo comando
    this.undoHistory = [];
    
    console.log(`✅ Comando ejecutado: ${command.description}`);
  }

  undo(): void {
    if (this.commandHistory.length === 0) {
      console.log('⚠️ No hay comandos para deshacer');
      return;
    }
    
    const command = this.commandHistory.pop()!;
    command.undo();
    this.undoHistory.push(command);
    
    console.log(`↩️ Comando deshecho: ${command.description}`);
  }

  redo(): void {
    if (this.undoHistory.length === 0) {
      console.log('⚠️ No hay comandos para rehacer');
      return;
    }
    
    const command = this.undoHistory.pop()!;
    command.execute();
    this.commandHistory.push(command);
    
    console.log(`↪️ Comando rehecho: ${command.description}`);
  }

  getCommandHistory(): Command[] {
    return [...this.commandHistory];
  }

  getUndoHistory(): Command[] {
    return [...this.undoHistory];
  }

  clearHistory(): void {
    this.commandHistory = [];
    this.undoHistory = [];
    console.log('🧹 Historial de comandos limpiado');
  }

  canUndo(): boolean {
    return this.commandHistory.length > 0;
  }

  canRedo(): boolean {
    return this.undoHistory.length > 0;
  }

  getLastCommand(): Command | null {
    return this.commandHistory.length > 0 
      ? this.commandHistory[this.commandHistory.length - 1] 
      : null;
  }
}