export const generate = (secretLen = 16, password = false) => {
    const date = new Date();
    let rnd = null;
    let secret = "";
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    for (let i = 0; i < secretLen; i++) {
        rnd = Math.floor(Math.random() * (characters.split("").length - 1));
        secret += characters[rnd];
    }

    if (!password) secret += `.${date.getTime()}`;
    
    return secret || null;
};

export const validate = () => {};
