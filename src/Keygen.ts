import EC from 'elliptic'

export class Keygen {
    private ec: EC.ec
    constructor () {
        this.ec = new EC.ec('secp256k1');
    }

    public genKey(): EC.ec.KeyPair {
        const key = this.ec.genKeyPair();
        return key;
    }
 }


