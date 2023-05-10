import { Transaction } from "./Transaction";
import CryptoJS from 'crypto-js';

export class Block {
    private timestamp: Date | number;
    private transactions: Transaction[];
    private previousHash: string;
    private hash: string;
    private nonce: number;
    public validatedBy: string | null;

    constructor(timestamp: Date | number, transactions: Transaction[], previousHash: string = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.generateHash();
        this.nonce = 0;
        this.validatedBy = null;
    }

    private generateHash(): string {
        return CryptoJS.SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    public validateBlock(previousBlock: Block): boolean {
        const hash = this.generateHash();
        if (hash !== this.hash) {
          return false;
        }
        if (this.previousHash !== previousBlock.hash) {
          return false;
        }
        return true;
    }

    public getTransactions(): Transaction[] {
        return this.transactions;
    }
      
    public getHash(): string {
        return this.hash;
    }

    public mineBlock(difficulty: number): void {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.generateHash();
        }

        console.log("Block Mined: " + this.hash);
    }

    public hasValidTxs(): boolean {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }
        return true;
    }
}
