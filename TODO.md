* readme / docs
* tslint -> move away from current inherited
* Date expressions e.g. j.with(m => m.propB, x => x > new Date("2017-01-01"));
* make value optional, j.with(m => m.propB); this should just make prop required.
* make es5 compatible

Limitations:
* Array - only min/max Items supported
* Date - only exact supported