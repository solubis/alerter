var localhost = window.location.protocol + '//' + window.location.hostname;
var port = window.location.port || '80';

window.IQ_CONFIG = {
    'version': '1.0.0-SNAPSHOT.20158301428',

    'restURL': 'http://10.9.8.166:5080/rest',
    'loginURL': 'http://10.9.8.166:5080/security',
    'publicKey': '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnGp/Q5lh0P8nPL21oMMrt2RrkT9AW5jgYwLfSUnJVc9G6uR3cXRRDCjHqWU5WYwivcF180A6CWp/ireQFFBNowgc5XaA0kPpzEtgsA5YsNX7iSnUibB004iBTfU9hZ2Rbsc8cWqynT0RyN4TP1RYVSeVKvMQk4GT1r7JCEC+TNu1ELmbNwMQyzKjsfBXyIOCFU/E94ktvsTZUHF4Oq44DBylCDsS1k7/sfZC2G5EU7Oz0mhG8+Uz6MSEQHtoIi6mc8u64Rwi3Z3tscuWG2ShtsUFuNSAFNkY7LkLn+/hxLCu2bNISMaESa8dG22CIMuIeRLVcAmEWEWH5EEforTg+QIDAQAB\n-----END PUBLIC KEY-----',
    'maxFileAttachmentSize': 10485760,
    'debugEnabled': false,
    'mockupEnabled': false,
    'redirectToLoginTimeout': 0

    // 'restURL': localhost + ':8083',
    // 'loginURL': localhost + ':' + port + '/lib/iqsec/ui/src/index.html',
};
