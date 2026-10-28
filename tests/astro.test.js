import test from 'node:test';
import assert from 'node:assert/strict';
import {astronomy,geoVector,DEG} from '../src/astro.js';
test('June and December solar declinations match the axial tilt',()=>{
 assert.ok(Math.abs(astronomy(Date.UTC(2026,5,21,12)).dec-23.5)<.1);
 assert.ok(Math.abs(astronomy(Date.UTC(2026,11,21,12)).dec+23.5)<.1);
});
test('Subsolar point is at zenith and its antipode is in midnight',()=>{
 for(let month=0;month<12;month++){
 const t=Date.UTC(2026,month,15,12),a=astronomy(t);
 assert.ok(Math.abs(astronomy(t,a.dec,a.subLon).alt-90)<.001);
 assert.ok(Math.abs(astronomy(t,-a.dec,a.subLon+180).alt+90)<.001);
 }
});
test('Geographic vector and raycast inverse preserve hemispheres',()=>{
 for(const [lat,lon] of [[31.23,121.47],[-33,-70],[80,-150]]){
 const p=geoVector(lat,lon);
 assert.ok(Math.abs(Math.asin(p.y)/DEG-lat)<1e-8);
 assert.ok(Math.abs(Math.atan2(-p.z,p.x)/DEG-lon)<1e-8);
 }
});
test('A solar day changes subsolar longitude by roughly 360 degrees',()=>{
 const t=Date.UTC(2026,9,28,0),a=astronomy(t),b=astronomy(t+12*3600000);
 assert.ok(Math.abs(Math.abs(a.subLon-b.subLon)-180)<1);
});
