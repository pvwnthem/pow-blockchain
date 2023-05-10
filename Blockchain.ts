import { Block } from "./Block";
import { Transaction } from "./Transaction";
import { Keygen } from "./Keygen";

export class Blockchain {
    chain: any[]
    difficulty: number
    pendingTransactions: Transaction[]
    transactionPool: Transaction[]
    reward: number
    constructor () {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
        this.pendingTransactions = []; 
        this.transactionPool = [];
        this.reward = 100;
    }

    createGenesisBlock () {
        return new Block( Date.now(), [], "0");
    }

    getLastBlock () {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions (minerAddress: string) {

        const rewardTx = new Transaction(null, minerAddress, this.reward)
        this.transactionPool.push(rewardTx); // add rewardTx to transactionPool
    
        // create a new block with transactions from pendingTransactions and transactionPool, limited to 1000 transactions
        const transactionsForBlock = [...this.pendingTransactions, ...this.transactionPool.slice(0, 1000)];
        let block = new Block(Date.now(), transactionsForBlock, this.getLastBlock().hash);
        block.mineBlock(this.difficulty);
        block.validatedBy = minerAddress;
        console.log("Block Mined!");
        this.chain.push(block);
    
        // remove transactions that were included in the newly mined block from both pendingTransactions and transactionPool
        this.pendingTransactions = this.pendingTransactions.filter(tx => !transactionsForBlock.includes(tx));
        this.transactionPool = this.transactionPool.filter(tx => !transactionsForBlock.includes(tx));
        
    }

    addTransaction (transaction: Transaction) {
        if (!transaction.sender || !transaction.recipient) {
            throw new Error("Transaction must have a sender and a recipient");
        }
    
        if (!transaction.isValid()) {
            throw new Error("Cannot add an invalid transaction");
        }
    
        const walletBalance = this.getBalance(transaction.sender);
        if (walletBalance < transaction.amount) {
            throw new Error('Not enough in your wallet to complete the transaction');
        }
        if (transaction.amount <= 0) {
            throw new Error('Transaction amount must be a positive non-zero amount');
        }
        const pending = this.pendingTransactions.filter(tx => tx.sender === transaction.sender);
        if (pending.length > 0) {
            const totalPendingAmount = pending.map(tx => tx.amount).reduce((prev, curr) => prev + curr);
            const totalAmount = totalPendingAmount + transaction.amount;
            if (totalAmount > walletBalance) {
                throw new Error('Pending transactions for this wallet is higher than its balance.');
            }
        }
    
        this.transactionPool.push(transaction);
        console.log("Added transaction: " + transaction);
    }

    getTransactionPool() {
        return this.transactionPool;
    }

    getBalance (address: string) {
        let balance = 0;

        for (const block of this.chain) {
            for (const transaction of block.transactions) {
                
                if (transaction.sender === address) {
                    balance -= transaction.amount
                }

                if (transaction.recipient === address) {
                    balance += transaction.amount
                }
            }
        }
        return balance;
    }
    validateChain(): boolean {
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

