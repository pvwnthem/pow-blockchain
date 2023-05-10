import CryptoJS from 'crypto-js';
import EC from 'elliptic'
const ec = new EC.ec('secp256k1');

export class Transaction {
    sender: string | null;
    recipient: string;
    amount: number;
    signature: string;
    constructor (sender: string | null, recipient: string, amount: number) {
        this.sender = sender;
        this.recipient = recipient;
        this.amount = amount;
        this.signature = '';
    }

    generateHash () {
        return CryptoJS.SHA256(this.sender + this.recipient + this.amount).toString();
    }

    signTransaction (key: any) {
        if (key.getPublic('hex') !== this.sender) {
            throw new Error('You cannot sign a transaction for another address!')
        }
        const hashTx = this.generateHash();
        const signature = key.sign(hashTx, 'base64');
        this.signature = signature.toDER('hex');
    }

    isValid() {
        if (this.sender === null) return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature is present in the transaction!')
        }

        const pk = ec.keyFromPublic(this.sender, 'hex');
        return pk.verify(this.generateHash(), this.signature)
    }
 }

