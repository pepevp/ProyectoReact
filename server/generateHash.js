const bcrypt = require('bcryptjs');

async function generateHash() {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('123456', salt);
    console.log(hash);
}

generateHash();
