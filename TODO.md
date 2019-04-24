* readme / docs
* tslint -> move away from current inherited
* Date expressions e.g. j.with(m => m.propB, x => x > new Date("2017-01-01"));
* make value optional, j.with(m => m.propB); this should just make prop required.
* make es5 compatible
* Draft 04 - once complete add $schema keyword: https://json-schema.org/understanding-json-schema/reference/schema.html
* combo support: https://json-schema.org/understanding-json-schema/reference/combining.html

Limitations:
* Array - only min/max Items supported
* Date - only exact supported, should probably change to be only a part of string as per spec
