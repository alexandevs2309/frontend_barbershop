export class ErrorUtil {
  static sanitizeForLog(input: any): string {
    if (input === null || input === undefined) return '';
    
    let stringInput: string;
    if (typeof input === 'string') {
      stringInput = input;
    } else if (typeof input === 'number') {
      stringInput = input.toString();
    } else {
      try {
        stringInput = JSON.stringify(input);
      } catch {
        return '[Object]';
      }
    }
    
    return stringInput.replace(/[\r\n\t]/g, ' ').trim().substring(0, 200);
  }

  static handleError(error: any, message?: string): string {
    if (message) return message;
    
    if (error?.error?.detail) {
      return ErrorUtil.sanitizeForLog(error.error.detail);
    }
    if (error?.error?.message) {
      return ErrorUtil.sanitizeForLog(error.error.message);
    }
    if (error?.message) {
      return ErrorUtil.sanitizeForLog(error.message);
    }
    return 'Ha ocurrido un error inesperado';
  }
}

export function sanitizeForLog(input: any): string {
  return ErrorUtil.sanitizeForLog(input);
}

export function handleError(error: any, message?: string): string {
  return ErrorUtil.handleError(error, message);
}