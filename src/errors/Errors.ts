export class Errors {
    static handleValidationError(message: string): void {
        console.error(`Validation Error: ${message}`);
    }

    static handleMiningError(message: string): void {
        console.error(`Mining Error: ${message}`);
    }

    static handleTransactionError(message: string): void {
        console.error(`Transaction Error: ${message}`);
    }
}