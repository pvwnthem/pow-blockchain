import EC from 'elliptic'

export class Keygen {
    ec: EC.ec
    constructor () {
        this.ec = new EC.ec('secp256k1');
    }

    genKey() {
        const key = this.ec.genKeyPair();
        return key;
    }
 }


