import { Block } from "./Block";
import { Transaction } from "./Transaction";
import { Keygen } from "./Keygen";
import { Errors } from "./errors/Errors";

export class Blockchain {
    private chain: Block[];
    private difficulty: number;
    private pendingTransactions: Transaction[];
    private transactionPool: Transaction[];
    private reward: number;

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
        this.pendingTransactions = [];
        this.transactionPool = [];
        this.reward = 100;
    }

    private createGenesisBlock(): Block {
        return new Block(Date.now(), [], "0");
    }

    private getLastBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    public minePendingTransactions(minerAddress: string): void {
        const rewardTx = new Transaction(null, minerAddress, this.reward);
        this.transactionPool.push(rewardTx);

        const transactionsForBlock = [...this.pendingTransactions, ...this.transactionPool.slice(0, 1000)];
        const block = new Block(Date.now(), transactionsForBlock, this.getLastBlock().getHash());
        block.mineBlock(this.difficulty);
        block.validatedBy = minerAddress;
        this.chain.push(block);

        this.pendingTransactions = this.pendingTransactions.filter(tx => !transactionsForBlock.includes(tx));
        this.transactionPool = this.transactionPool.filter(tx => !transactionsForBlock.includes(tx));
    }

    public addTransaction(transaction: Transaction): void {
        if (!transaction.getSender() || !transaction.getRecipient()) {
            Errors.handleTransactionError("Transaction must have a sender and a recipient");
            return
        }

        if (!transaction.isValid()) {
            Errors.handleTransactionError("Cannot add an invalid transaction");
            return
        }

        const walletBalance = this.getBalance(transaction.getSender());
        if (walletBalance < transaction.getAmount()) {
            Errors.handleTransactionError('Not enough in your wallet to complete the transaction');
            return
        }
        if (transaction.getAmount() <= 0) {
            Errors.handleTransactionError('Transaction amount must be a positive non-zero amount');
            return
        }
        const pending = this.pendingTransactions.filter(tx => tx.getSender() === transaction.getSender());
        if (pending.length > 0) {
            const totalPendingAmount = pending.map(tx => tx.getAmount()).reduce((prev, curr) => prev + curr);
            const totalAmount = totalPendingAmount + transaction.getAmount();
            if (totalAmount > walletBalance) {
                Errors.handleTransactionError('Pending transactions for this wallet is higher than its balance.');
                return
            }
        }

        this.transactionPool.push(transaction);
    }

    public getTransactionPool(): Transaction[] {
        return this.transactionPool;
    }

    public getBalance(address: string | null): number {
        let balance = 0;

        for (const block of this.chain) {
            for (const transaction of block.getTransactions()) {

                if (transaction.getSender() === address) {
                    balance -= transaction.getAmount();
                }

                if (transaction.getRecipient() === address) {
                    balance += transaction.getAmount();
                }
            }
        }
        return balance;
    }

    public validateChain(): boolean {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            if (!currentBlock.validateBlock(previousBlock)) {
                return false;
            }
        }
        return true;
    }
}


// Example Usage

// Create Instances of The Blockchain and KeyGenerator
//const keypair = new Keygen().genKey()
//const chain = new Blockchain()

// Create a new transaction to add to the chain
//const transaction = new Transaction(keypair.getPublic('hex') /* your public key */, 'Public key of the address to send to', 10 /* amount */)

// Sign the transaction
//transaction.signTransaction(keypair)

// Add the transaction to the chain
//chain.addTransaction(transaction)


// Start Mining the transactions on the chain
//chain.minePendingTransactions(keypair.getPublic('hex') /* your public key, where reward will be paid out */)


// Get the balance of your address after mining is complete
//console.log(chain.getBalance(keypair.getPublic('hex')))


//console.log("Chain is valid: " + chain.validateChain()); // Output: Chain is valid: true

