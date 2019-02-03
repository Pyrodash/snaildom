const regex  = /^\$2[ayb]\$.{56}$/gm;
const bcrypt = require('bcrypt-nodejs');

module.exports = {
  validHash: function(hash) {
    const res = hash.match(regex);

    return res && res.length > 0;
  },
  hash: function(str) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(str, null, null, (err, hash) => {
        if(err)
          reject(err)
        else
          resolve(hash.replace('$2a$', '$2y$'));
      });
    });
  }
}