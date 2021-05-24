/**
 * Gets firstname from donor object
 * @param {Donor} donor
 * @return {string} The firstname
 */
function getFirstname(donor) {
    var nameSplit = donor.name.split(' ');
    return nameSplit[0];
}
/**
 * Gets last name of donor
 * @param {Donor} donor
 * @param {boolean} full Whether to include all names after firstname, or only last name
 */
function getLastname(donor, full) {
    if (full === void 0) { full = true; }
    var nameSplit = donor.name.split(' ');
    if (!full)
        return nameSplit[nameSplit.length - 1];
    else
        return nameSplit.shift() && nameSplit.join(' ');
}
module.exports = {
    getFirstname: getFirstname,
    getLastname: getLastname
};
