function convertDate(mysqlDate) {
    // mysqlDate = "2021-12-29T01:37:53.000Z"
    var t = mysqlDate.split(/[- T : .]/);

    // Apply each element to the Date function
    var d = new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));

    //console.log(d);
    // -> Wed Dec 29 2021 03:37:53 GMT+0200 (Eastern European Standard Time)

    d = `${d}`.split(' '); 
    // [Wed, Dec, 29, 2021, 03:37:53, GMT+0200, (Eastern European Standard Time)]
    d = d.slice(0,5); // [Wed, Dec, 29, 2021, 03:37:53]
    d = d.join(' ');
    return `${d}`; // as string
}

module.exports = convertDate;