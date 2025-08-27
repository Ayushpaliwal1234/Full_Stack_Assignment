const bcrypt = require('bcryptjs');

async function generatePasswordHashes() {
    const password = 'Admin123!';
    const saltRounds = 10;
    
    console.log('Generating password hashes for: ' + password);
    console.log('Salt rounds:', saltRounds);
    console.log('');
    
    for (let i = 1; i <= 5; i++) {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log(`Hash ${i}: ${hash}`);
        
        // Verify the hash works
        const isValid = await bcrypt.compare(password, hash);
        console.log(`Verification: ${isValid ? 'VALID' : 'INVALID'}`);
        console.log('');
    }
}

generatePasswordHashes().catch(console.error);
