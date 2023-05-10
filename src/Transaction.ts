import CryptoJS from 'crypto-js';
import EC from 'elliptic';
import { Errors } from "./errors/Errors";

const ec = new EC.ec('secp256k1');

export class Transaction {
    private sender: string | null;
    private recipient: string;
    private amount: number;
    private signature: string;
    public transactionFee: number

    constructor(sender: string | null, recipient: string, amount: number, transactionFee: number = 1) {
        this.sender = sender;
        this.recipient = recipient;
        this.amount = amount;
        this.signature = '';
        this.transactionFee = transactionFee;
    }

    private generateHash(): string {
        return CryptoJS.SHA256(this.sender + this.recipient + this.amount).toString();
    }

    public signTransaction(key: any): void {
        if (key.getPublic('hex') !== this.sender) {
            Errors.handleTransactionError('You cannot sign a transaction for another address!');
            return
        }
        const hashTx = this.generateHash();
        const signature = key.sign(hashTx, 'base64');
        this.signature = signature.toDER('hex');
    }

    public getRecipient(): string {
        return this.recipient
    }

    public getAmount(): number {
        return this.amount;
    }

    public getSender(): string | null {
        return this.sender;
    }

    public isValid(): boolean {
        if (this.sender === null) {
            return true;
        }

        if (!this.signature || this.signature.length === 0) {
            Errors.handleValidationError('No signature is present in the transaction!');
            return false;
        }

        const pk = ec.keyFromPublic(this.sender, 'hex');
        return pk.verify(this.generateHash(), this.signature);
    }
}
