const deepFreeze = (obj) => {
    Object.keys(obj).forEach((property) => {
      if (
        typeof obj[property] === "object" &&
        !Object.isFrozen(obj[property])
      )
        deepFreeze(obj[property]);
    });
    return Object.freeze(obj);
};
module.exports = {
    deepFreeze
}